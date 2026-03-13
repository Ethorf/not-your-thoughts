import { useEffect, useMemo, useState } from 'react'

import {
  buildClusters,
  buildGlobalNodeSphereTextures,
  generateClusterPositions,
  getClusterConnectionScore,
  getClusterHubNode,
  positionGlobalNodes,
} from '@utils/globalViewHelpers'
import { deserializeClusterView, getGlobalViewCacheKey } from '@utils/globalViewCacheSerialization'
import { setGlobalRenderOwners } from '@redux/reducers/currentEntryReducer'
import { fetchAllConnections } from '@redux/reducers/connectionsReducer'
import { setGlobalViewCache } from '@redux/reducers/globalViewCacheReducer'

const FILTER_EMPTY_CLUSTERS = false

const deduplicateClusterViews = (views) => {
  const seenNodeIds = new Set()
  const deduplicated = []

  for (const view of views) {
    if (FILTER_EMPTY_CLUSTERS) {
      const hasConnections = (view.firstOrderNodes?.length ?? 0) > 0 || (view.secondOrderNodes?.length ?? 0) > 0
      if (!hasConnections && view.mainNode) continue
    }

    const mainNode = view.mainNode ?? null
    if (mainNode?.node?.id) seenNodeIds.add(mainNode.node.id)

    const firstOrderNodes = view.firstOrderNodes || []
    firstOrderNodes.forEach((entry) => {
      if (entry?.node?.id) seenNodeIds.add(entry.node.id)
    })

    const secondOrderNodes = (view.secondOrderNodes || []).filter((entry) => {
      const id = entry?.node?.id
      if (!id || seenNodeIds.has(id)) return false
      seenNodeIds.add(id)
      return true
    })

    if (!mainNode && !firstOrderNodes.length && !secondOrderNodes.length) continue

    deduplicated.push({
      ...view,
      mainNode,
      firstOrderNodes,
      secondOrderNodes,
    })
  }

  return deduplicated
}

const useGlobalGraphPipeline = ({
  nodeEntriesInfo,
  allConnections,
  connectionsLoading,
  globalViewCache,
  globalViewInvalidated,
  dispatch,
  userId,
}) => {
  const [graphNodes, setGraphNodes] = useState([])
  const [graphConnections, setGraphConnections] = useState([])
  const [clusterViews, setClusterViews] = useState([])
  const [isPositioningClusters, setIsPositioningClusters] = useState(false)
  const [positioningProgress, setPositioningProgress] = useState(0)

  // Stage 1: source all nodes used by the global graph.
  useEffect(() => {
    setGraphNodes(nodeEntriesInfo.filter((node) => node.isPrivate === false) ?? [])
  }, [nodeEntriesInfo])

  // Stage 2a: fetch the global connection set.
  useEffect(() => {
    if (!graphNodes.length || userId == null) {
      setGraphConnections([])
      return
    }

    const needsFetch = !allConnections?.length || globalViewInvalidated
    if (needsFetch) {
      dispatch(fetchAllConnections(userId))
    }
  }, [dispatch, graphNodes.length, allConnections?.length, globalViewInvalidated, userId])

  // Stage 2b: keep only connections that attach to known nodes.
  const graphNodeIds = useMemo(
    () => new Set(graphNodes.map((node) => node?.id).filter((id) => id != null)),
    [graphNodes]
  )
  useEffect(() => {
    if (!graphNodes.length) {
      setGraphConnections([])
      return
    }

    const normalizedConnections = allConnections.filter((conn) => {
      const sourceId = conn?.entry_id
      const targetId = conn?.foreign_entry_id
      return graphNodeIds.has(sourceId) && graphNodeIds.has(targetId)
    })

    // DEBUG: trace node 1003
    const DEBUG_ID = 1003
    const inGraphNodes = graphNodeIds.has(DEBUG_ID)
    const rawConns = allConnections.filter(
      (c) => c?.entry_id === DEBUG_ID || c?.foreign_entry_id === DEBUG_ID
    )
    const survivingConns = normalizedConnections.filter(
      (c) => c?.entry_id === DEBUG_ID || c?.foreign_entry_id === DEBUG_ID
    )
    console.log(`[DEBUG 1003] In graphNodes: ${inGraphNodes}, raw connections: ${rawConns.length}, surviving connections: ${survivingConns.length}`, { rawConns, survivingConns })

    setGraphConnections(normalizedConnections)
  }, [allConnections, graphNodes.length, graphNodeIds])

  // Stage 3: build clusters and position spheres from the staged graph.
  const { clusters, adjacency } = useMemo(() => {
    if (!graphNodes || !graphConnections) {
      return { clusters: [], adjacency: new Map() }
    }
    const result = buildClusters(graphNodes, graphConnections)
    // DEBUG: check which cluster 1003 is in
    const clusterIdx = result.clusters.findIndex((c) => c.includes(1003))
    const neighbors = result.adjacency.get(1003) || []
    console.log(`[DEBUG 1003] Cluster index: ${clusterIdx}, adjacency neighbors: [${neighbors.join(',')}]`)
    if (clusterIdx >= 0) {
      console.log(`[DEBUG 1003] Cluster members: [${result.clusters[clusterIdx].join(',')}]`)
    }
    return result
  }, [graphNodes, graphConnections])

  useEffect(() => {
    let isMounted = true
    const cacheKey = getGlobalViewCacheKey(graphNodes, graphConnections)

    const positionAllClusters = async () => {
      if (!clusters?.length || !adjacency) {
        if (isMounted) {
          setClusterViews([])
          setIsPositioningClusters(false)
          setPositioningProgress(0)
        }
        return
      }

      if (globalViewInvalidated && connectionsLoading) {
        return
      }

      if (globalViewCache?.clusterViews?.length && globalViewCache.cacheKey === cacheKey && !globalViewInvalidated) {
        const views = globalViewCache.clusterViews.map(deserializeClusterView).filter(Boolean)
        if (isMounted && views.length) {
          setClusterViews(views)
          if (globalViewCache.mergedRenderOwners) {
            dispatch(setGlobalRenderOwners(globalViewCache.mergedRenderOwners))
          }
        }
        return
      }

      if (isMounted) {
        setIsPositioningClusters(true)
        setPositioningProgress(0)
      }

      const sortedByConnections = clusters
        .map((cluster) => ({
          cluster,
          hubId: getClusterHubNode(cluster, adjacency),
          connectionScore: getClusterConnectionScore(cluster, adjacency),
        }))
        .filter((item) => item.hubId)
        .sort((a, b) => {
          if (b.connectionScore !== a.connectionScore) return b.connectionScore - a.connectionScore
          if (b.cluster.length !== a.cluster.length) return b.cluster.length - a.cluster.length
          return (a.hubId ?? 0) - (b.hubId ?? 0)
        })

      const clusterCenters = generateClusterPositions(sortedByConnections.map((s) => s.connectionScore))
      const results = []
      const totalClusters = sortedByConnections.length

      for (let i = 0; i < totalClusters; i++) {
        const { hubId: hubNodeId } = sortedByConnections[i]
        const clusterCenter = clusterCenters[i] ?? null
        const result = await positionGlobalNodes(
          graphNodes,
          graphConnections,
          clusters,
          dispatch,
          hubNodeId,
          clusterCenter
        )
        results.push(result)
        if (isMounted) {
          setPositioningProgress((i + 1) / totalClusters)
        }
      }

      if (!isMounted) return

      const views = results.map((result) => ({
        mainNode: result.mainNode,
        firstOrderNodes: result.firstOrderNodes,
        secondOrderNodes: result.secondOrderNodes || [],
        firstOrderConnectionsMap: result.firstOrderConnectionsMap,
      }))

      // DEBUG: trace 1003 through pipeline results
      views.forEach((v, i) => {
        const mainId = v.mainNode?.node?.id
        const inFirst = (v.firstOrderNodes || []).some((e) => e?.node?.id === 1003)
        const inSecond = (v.secondOrderNodes || []).some((e) => e?.node?.id === 1003)
        if (mainId === 1003 || inFirst || inSecond) {
          console.log(`[DEBUG 1003] Found in view[${i}] (hub=${mainId}): firstOrder=${inFirst}, secondOrder=${inSecond}`)
        }
      })

      const deduplicated = deduplicateClusterViews(views)

      // DEBUG: trace 1003 after dedup
      deduplicated.forEach((v, i) => {
        const mainId = v.mainNode?.node?.id
        const inFirst = (v.firstOrderNodes || []).some((e) => e?.node?.id === 1003)
        const inSecond = (v.secondOrderNodes || []).some((e) => e?.node?.id === 1003)
        if (mainId === 1003 || inFirst || inSecond) {
          console.log(`[DEBUG 1003] After dedup view[${i}] (hub=${mainId}): firstOrder=${inFirst}, secondOrder=${inSecond}`)
        }
      })

      setClusterViews(deduplicated)
      setIsPositioningClusters(false)

      const mergedRenderOwners = results.reduce((acc, result) => ({ ...acc, ...(result.renderOwnerMap || {}) }), {})
      dispatch(setGlobalRenderOwners(mergedRenderOwners))
      dispatch(
        setGlobalViewCache({
          clusterViews: deduplicated,
          cacheKey,
          mergedRenderOwners,
        })
      )
    }

    positionAllClusters()
    return () => {
      isMounted = false
      setIsPositioningClusters(false)
      setPositioningProgress(0)
    }
  }, [
    graphNodes,
    graphConnections,
    clusters,
    adjacency,
    dispatch,
    globalViewCache,
    globalViewInvalidated,
    connectionsLoading,
  ])

  const allNodesForTextures = useMemo(() => {
    const nodes = []
    clusterViews.forEach((view) => {
      if (view.mainNode) nodes.push(view.mainNode)
      nodes.push(...(view.firstOrderNodes || []))
      nodes.push(...(view.secondOrderNodes || []))
    })
    return nodes
  }, [clusterViews])

  const nodeTextures = useMemo(() => buildGlobalNodeSphereTextures(allNodesForTextures), [allNodesForTextures])
  const hasClustersToProcess = clusters?.length > 0 && adjacency?.size !== undefined

  return {
    clusterViews,
    nodeTextures,
    allNodesForTextures,
    hasClustersToProcess,
    isPositioningClusters,
    positioningProgress,
  }
}

export default useGlobalGraphPipeline
