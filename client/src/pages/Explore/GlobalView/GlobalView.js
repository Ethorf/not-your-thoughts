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
  positionGlobalNodes,
} from '@utils/globalViewHelpers'

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

  const { allConnections } = useSelector((state) => state.connections)
  const { entryId } = useSelector((state) => state.currentEntry)
  const [cameraRotation, setCameraRotation] = useState({ azimuth: 0, polar: 0 })
  const [clusterViews, setClusterViews] = useState([])
  const [hoverInfo, setHoverInfo] = useState(null)
  const controlsRef = useRef()

  // Fetch all connections on mount
  useEffect(() => {
    dispatch(fetchAllConnections())
  }, [dispatch])

  // Track camera rotation
  const handleCameraChange = useCallback(() => {
    if (controlsRef.current) {
      const azimuthalAngle = controlsRef.current.getAzimuthalAngle()
      const polarAngle = controlsRef.current.getPolarAngle()
      setCameraRotation({
        azimuth: ((azimuthalAngle * 180) / Math.PI).toFixed(1),
        polar: ((polarAngle * 180) / Math.PI).toFixed(1),
      })
    }
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

  // Handle async positioning of nodes for each cluster (hub = node with most connections)
  useEffect(() => {
    const positionAllClusters = async () => {
      if (!clusters?.length || !adjacency) {
        setClusterViews([])
        return
      }

      const clusterCenters = generateClusterPositions(clusters.length, 3)
      const results = []

      for (let index = 0; index < clusters.length; index++) {
        const cluster = clusters[index]
        const hubNodeId = getClusterHubNode(cluster, adjacency)
        if (!hubNodeId) continue

        const clusterCenter = clusterCenters[index] ?? null
        const result = await positionGlobalNodes(
          nodeEntriesInfo,
          allConnections,
          clusters,
          dispatch,
          hubNodeId,
          clusterCenter
        )
        results.push(result)
      }

      const validResults = results
      const views = validResults.map((r) => ({
        mainNode: r.mainNode,
        firstOrderNodes: r.firstOrderNodes,
        secondOrderNodes: r.secondOrderNodes || [],
        firstOrderConnectionsMap: r.firstOrderConnectionsMap,
      }))

      setClusterViews(deduplicateClusterViews(views))

      // Merge renderOwnerMap from all clusters
      const mergedRenderOwners = validResults.reduce((acc, r) => ({ ...acc, ...(r.renderOwnerMap || {}) }), {})
      dispatch(setGlobalRenderOwners(mergedRenderOwners))
    }

    positionAllClusters()
  }, [nodeEntriesInfo, allConnections, clusters, adjacency, dispatch])

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
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />

          <Suspense fallback={null}>
            <FaceCameraProvider>
              <CameraController nodePositions={allNodesForTextures} entryId={entryId} controlsRef={controlsRef} />

              <GradientGlobe />

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
