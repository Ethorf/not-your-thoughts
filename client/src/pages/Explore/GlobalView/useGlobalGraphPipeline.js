import { useEffect, useMemo, useState, useRef } from 'react'

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
const toNumericId = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

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

  const graphOwnerKey = userId === undefined || userId === null ? '' : String(userId)

  const graphNodesSignature = useMemo(
    () =>
      (graphNodes || [])
        .map((n) => n.id)
        .filter((id) => id != null)
        .sort((a, b) => a - b)
        .join(','),
    [graphNodes]
  )

  const lastFetchContextRef = useRef({ signature: '', ownerKey: '' })

  // Stage 1: source all nodes used by the global graph.
  useEffect(() => {
    const normalizedNodes = (nodeEntriesInfo || [])
      .filter((node) => node.isPrivate === false)
      .map((node) => {
        const normalizedId = toNumericId(node?.id)
        return normalizedId == null ? null : { ...node, id: normalizedId }
      })
      .filter(Boolean)

    setGraphNodes(normalizedNodes)
  }, [nodeEntriesInfo])

  // Stage 2a: fetch the global connection set for the current graph owner + public node list.
  // Re-fetch when the node set or owner changes, even if allConnections still has data from a prior graph
  // (otherwise Stage 2b filters stale edges and clusters look incomplete).
  useEffect(() => {
    if (!graphNodes.length) {
      lastFetchContextRef.current = { signature: '', ownerKey: '' }
      return
    }

    const ownerKey = graphOwnerKey
    const signature = graphNodesSignature
    const contextChanged =
      lastFetchContextRef.current.signature !== signature || lastFetchContextRef.current.ownerKey !== ownerKey

    // Do not key off globalViewInvalidated here: it stays true until Global View finishes and writes cache,
    // which would re-dispatch fetch in a loop while allConnections is already populated.
    // Stale graphs are handled by clearing allConnections when connections mutate (see connectionsReducer).
    const needsFetch = !allConnections?.length || contextChanged

    if (!needsFetch) {
      return
    }

    // One in-flight fetch per graph context (shared connectionsLoading is also used by fetchConnections, etc.).
    if (
      connectionsLoading &&
      lastFetchContextRef.current.signature === signature &&
      lastFetchContextRef.current.ownerKey === ownerKey
    ) {
      return
    }

    lastFetchContextRef.current = { signature, ownerKey }
    dispatch(fetchAllConnections(userId))
  }, [
    dispatch,
    graphNodes.length,
    graphNodesSignature,
    graphOwnerKey,
    allConnections?.length,
    userId,
    connectionsLoading,
  ])

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

    const normalizedConnections = (allConnections || [])
      .map((conn) => {
        const sourceId = toNumericId(conn?.entry_id)
        const targetId = toNumericId(conn?.foreign_entry_id)
        if (sourceId == null || targetId == null) return null
        return {
          ...conn,
          entry_id: sourceId,
          foreign_entry_id: targetId,
        }
      })
      .filter(Boolean)
      .filter((conn) => graphNodeIds.has(conn.entry_id) && graphNodeIds.has(conn.foreign_entry_id))

    setGraphConnections(normalizedConnections)
  }, [allConnections, graphNodes, graphNodeIds])

  // Stage 3: build clusters and position spheres from the staged graph.
  const { clusters, adjacency } = useMemo(() => {
    if (!graphNodes || !graphConnections) {
      return { clusters: [], adjacency: new Map() }
    }
    const result = buildClusters(graphNodes, graphConnections)
    return result
  }, [graphNodes, graphConnections])

  useEffect(() => {
    let isMounted = true
    const cacheKey = getGlobalViewCacheKey(graphNodes, graphConnections, graphOwnerKey)

    const positionAllClusters = async () => {
      if (!clusters?.length || !adjacency) {
        if (isMounted) {
          setClusterViews([])
          setIsPositioningClusters(false)
          setPositioningProgress(0)
        }
        return
      }

      // connectionsLoading is shared (modal fetchConnections, etc.). Only wait when the *global* edge list
      // is empty because fetchAllConnections is still in flight — never block solely on globalViewInvalidated.
      if (connectionsLoading && (allConnections?.length ?? 0) === 0) {
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

      const deduplicated = deduplicateClusterViews(views)

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
    allConnections,
    graphOwnerKey,
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
