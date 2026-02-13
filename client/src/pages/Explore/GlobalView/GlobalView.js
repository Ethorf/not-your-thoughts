import React, { Suspense, useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

// Redux
import { setEntryById, setGlobalRenderOwners } from '@redux/reducers/currentEntryReducer'
import { fetchAllConnections } from '@redux/reducers/connectionsReducer'
import { setGlobalViewCache } from '@redux/reducers/globalViewCacheReducer'

// Styles
import styles from './GlobalView.module.scss'
import TextButton from '@components/Shared/TextButton/TextButton'

// Components
import CameraController from './CameraController'
import GradientGlobe from './GradientGlobe'
import GlobalClusterView from './GlobalClusterView'
import { FaceCameraProvider } from '@components/Spheres/SphereWithEffects'

// Utils
import {
  buildGlobalNodeSphereTextures,
  buildClusters,
  generateClusterPositions,
  getClusterHubNode,
  getClusterConnectionScore,
  positionGlobalNodes,
} from '@utils/globalViewHelpers'
import { getGlobalViewCacheKey, deserializeClusterView } from '@utils/globalViewCacheSerialization'

/** Set to true to hide clusters with no connections (isolated single-node clusters) */
const FILTER_EMPTY_CLUSTERS = false

/**
 * Deduplicate nodes across cluster views - each node appears in exactly one cluster.
 * Also optionally filters out clusters with no connections.
 */
const deduplicateClusterViews = (views) => {
  const seenNodeIds = new Set()
  const deduplicated = []

  for (const view of views) {
    if (FILTER_EMPTY_CLUSTERS) {
      const hasConnections = (view.firstOrderNodes?.length ?? 0) > 0 || (view.secondOrderNodes?.length ?? 0) > 0
      if (!hasConnections && view.mainNode) continue
    }

    // Main node is always kept - each cluster's hub is unique to that cluster
    const mainNode = view.mainNode ?? null
    if (mainNode?.node?.id) seenNodeIds.add(mainNode.node.id)

    const firstOrderNodes = (view.firstOrderNodes || []).filter((entry) => {
      const id = entry?.node?.id
      if (!id || seenNodeIds.has(id)) return false
      seenNodeIds.add(id)
      return true
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

const GlobalView = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const dispatch = useDispatch()

  const { allConnections, connectionsLoading } = useSelector((state) => state.connections)
  const { entryId, entriesLoading } = useSelector((state) => state.currentEntry)
  const { cache: globalViewCache, invalidated: globalViewInvalidated } = useSelector((state) => state.globalViewCache)
  const [clusterViews, setClusterViews] = useState([])
  const [isPositioningClusters, setIsPositioningClusters] = useState(false)
  const [positioningProgress, setPositioningProgress] = useState(0)
  const [hoverInfo, setHoverInfo] = useState(null)
  const controlsRef = useRef()

  // Fetch all connections only when empty or cache invalidated (e.g. after creating node/connection)
  useEffect(() => {
    const needsFetch = !allConnections?.length || globalViewInvalidated
    if (needsFetch) {
      dispatch(fetchAllConnections())
    }
  }, [dispatch, allConnections?.length, globalViewInvalidated])

  const handleCameraChange = useCallback(() => {
    // Kept for OrbitControls onChange; can extend for camera position display
  }, [])

  const handleNodeClick = useCallback(
    async (nodeId) => {
      await dispatch(setEntryById(nodeId))
      history.push(`/explore?entryId=${nodeId}`)
    },
    [dispatch, history]
  )

  const handleNodeHover = useCallback((info) => {
    setHoverInfo(info)
  }, [])

  // Build clusters and place them on globe
  const { clusters, adjacency } = useMemo(() => {
    if (!nodeEntriesInfo || !allConnections) {
      return { clusters: [], adjacency: new Map() }
    }

    const result = buildClusters(nodeEntriesInfo, allConnections)
    return result
  }, [nodeEntriesInfo, allConnections])

  // Handle async positioning of nodes for each cluster (hub = node with most connections).
  // Use cache when valid to avoid recomputation when returning to Global View.
  useEffect(() => {
    let isMounted = true
    const cacheKey = getGlobalViewCacheKey(nodeEntriesInfo, allConnections)

    const positionAllClusters = async () => {
      if (!clusters?.length || !adjacency) {
        if (isMounted) {
          setClusterViews([])
          setIsPositioningClusters(false)
          setPositioningProgress(0)
        }
        return
      }

      // When invalidated, wait for fresh allConnections before computing
      if (globalViewInvalidated && connectionsLoading) {
        return
      }

      // Check for valid cache: same data, not invalidated
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
          // Primary: most connections first (equator)
          if (b.connectionScore !== a.connectionScore) return b.connectionScore - a.connectionScore
          // Tiebreaker: larger cluster first
          if (b.cluster.length !== a.cluster.length) return b.cluster.length - a.cluster.length
          // Stable: hub ID
          return (a.hubId ?? 0) - (b.hubId ?? 0)
        })
      const clusterCenters = generateClusterPositions(sortedByConnections.map((s) => s.connectionScore))
      const results = []

      const totalClusters = sortedByConnections.length
      for (let i = 0; i < totalClusters; i++) {
        const { hubId: hubNodeId } = sortedByConnections[i]
        const clusterCenter = clusterCenters[i] ?? null
        const result = await positionGlobalNodes(
          nodeEntriesInfo,
          allConnections,
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

      const validResults = results
      const views = validResults.map((r) => ({
        mainNode: r.mainNode,
        firstOrderNodes: r.firstOrderNodes,
        secondOrderNodes: r.secondOrderNodes || [],
        firstOrderConnectionsMap: r.firstOrderConnectionsMap,
      }))

      if (!isMounted) return
      const deduplicated = deduplicateClusterViews(views)
      setClusterViews(deduplicated)
      setIsPositioningClusters(false)

      // Merge renderOwnerMap from all clusters
      const mergedRenderOwners = validResults.reduce((acc, r) => ({ ...acc, ...(r.renderOwnerMap || {}) }), {})
      dispatch(setGlobalRenderOwners(mergedRenderOwners))

      // Cache for next visit
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
    nodeEntriesInfo,
    allConnections,
    clusters,
    adjacency,
    dispatch,
    globalViewCache,
    globalViewInvalidated,
    connectionsLoading,
  ])

  // Combine all nodes from all clusters for texture generation and camera framing
  const allNodesForTextures = useMemo(() => {
    const nodes = []
    clusterViews.forEach((view) => {
      if (view.mainNode) nodes.push(view.mainNode)
      nodes.push(...(view.firstOrderNodes || []))
      nodes.push(...(view.secondOrderNodes || []))
    })
    return nodes
  }, [clusterViews])

  // Create texture for each node
  const nodeTextures = useMemo(() => buildGlobalNodeSphereTextures(allNodesForTextures), [allNodesForTextures])

  const isLoading =
    entriesLoading ||
    (connectionsLoading && (!allConnections?.length || globalViewInvalidated)) ||
    isPositioningClusters

  // Loading progress: entries 0-25%, connections 25-45%, positioning 45-100%
  const loadingPercent = isLoading
    ? entriesLoading
      ? 15
      : connectionsLoading && (!allConnections?.length || globalViewInvalidated)
        ? 35
        : Math.round(45 + positioningProgress * 55)
    : 100

  // Calculate rotation so sphere texture faces the camera
  const getSphereRotation = useCallback((spherePosition) => {
    // Calculate the angle from the sphere to the camera view
    const direction = new THREE.Vector3(spherePosition.x, 0, spherePosition.z).normalize()
    const angle = Math.atan2(direction.x, direction.z)

    return [0, angle + 4.5, 0] // Add base offset of 4.7
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Global Mind Map</h1>
        <TextButton
          className={styles.backButton}
          onClick={() => history.push('/explore')}
          tooltip="Return to Local View"
        >
          ← Local View
        </TextButton>
      </div>
      <div className={styles.globeContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <span className={styles.loadingText}>Mapping your mind network...</span>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarFill} style={{ width: `${loadingPercent}%` }} />
            </div>
            <span className={styles.loadingPercent}>{loadingPercent}%</span>
          </div>
        )}
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />

          <Suspense fallback={null}>
            <FaceCameraProvider>
              <CameraController nodePositions={allNodesForTextures} entryId={entryId} controlsRef={controlsRef} />

              <GradientGlobe isLoading={isLoading} />

              {clusterViews.map((view, index) => (
                <GlobalClusterView
                  key={view.mainNode?.node?.id ?? `cluster-${index}`}
                  mainNode={view.mainNode}
                  firstOrderNodes={view.firstOrderNodes}
                  firstOrderConnectionsMap={view.firstOrderConnectionsMap}
                  nodeTextures={nodeTextures}
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  getSphereRotation={getSphereRotation}
                />
              ))}
            </FaceCameraProvider>
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={12}
            onChange={handleCameraChange}
          />
        </Canvas>
      </div>

      <div className={`${styles.info} ${hoverInfo ? '' : styles.infoHidden}`}>
        <h2 className={styles.nodeTitle}>{hoverInfo?.nodeTitle}</h2>
        <div className={styles.nodeInfo}>
          <p>Cluster Center: {hoverInfo?.clusterCenterTitle || ''}</p>
          <p>Connection: {hoverInfo?.connectionType || ''}</p>
          <p>
            Nearest: {hoverInfo?.parentTitle || ''} {hoverInfo?.connectionType ? `(${hoverInfo.connectionType})` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

export default GlobalView
