import React, { Suspense, useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { fetchAllConnections } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './GlobalView.module.scss'
import TextButton from '@components/Shared/TextButton/TextButton'

// Constants
import { SPHERE_TYPES, DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Components
import CameraController from './CameraController'
import GradientGlobe from './GradientGlobe'

// Utils
import {
  buildFirstOrderConnectionLines,
  buildSecondOrderConnectionLines,
  buildGlobalNodeSphereTextures,
  buildClusters,
  positionGlobalNodes,
} from '@utils/globalViewHelpers'

const GlobalView = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const dispatch = useDispatch()

  const { allConnections } = useSelector((state) => state.connections)
  const { entryId } = useSelector((state) => state.currentEntry)
  const [cameraRotation, setCameraRotation] = useState({ azimuth: 0, polar: 0 })
  const [mainNode, setMainNode] = useState(null)
  const [firstOrderNodes, setFirstOrderNodes] = useState([])
  const [secondOrderNodes, setSecondOrderNodes] = useState([])
  const [firstOrderConnectionsMap, setFirstOrderConnectionsMap] = useState(new Map())
  const [secondOrderConnectionsMap, setSecondOrderConnectionsMap] = useState(new Map())
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

  // Build clusters and place them on globe
  const { clusters, adjacency } = useMemo(() => {
    if (!nodeEntriesInfo || !allConnections) {
      return { clusters: [], adjacency: new Map() }
    }

    const { clusters, adjacency } = buildClusters(nodeEntriesInfo, allConnections)

    return { clusters, adjacency }
  }, [nodeEntriesInfo, allConnections])

  // Handle async positioning of nodes in clusters
  useEffect(() => {
    const positionNodes = async () => {
      const result = await positionGlobalNodes(nodeEntriesInfo, allConnections, clusters, dispatch, 990)
      setMainNode(result.mainNode)
      setFirstOrderNodes(result.firstOrderNodes)
      setSecondOrderNodes(result.secondOrderNodes)
      setFirstOrderConnectionsMap(result.firstOrderConnectionsMap)
      setSecondOrderConnectionsMap(result.secondOrderConnectionsMap)
    }

    positionNodes()
  }, [nodeEntriesInfo, allConnections, clusters, dispatch])

  // Combine all nodes for texture generation
  const allNodesForTextures = useMemo(() => {
    const nodes = []
    if (mainNode) nodes.push(mainNode)
    nodes.push(...firstOrderNodes)
    nodes.push(...secondOrderNodes)
    return nodes
  }, [mainNode, firstOrderNodes, secondOrderNodes])

  // Create texture for each node
  const nodeTextures = useMemo(() => buildGlobalNodeSphereTextures(allNodesForTextures), [allNodesForTextures])

  // Build connection lines separately
  const firstOrderConnectionLines = useMemo(
    () => buildFirstOrderConnectionLines(mainNode, firstOrderNodes, firstOrderConnectionsMap),
    [mainNode, firstOrderNodes, firstOrderConnectionsMap]
  )

  const secondOrderConnectionLines = useMemo(
    () => buildSecondOrderConnectionLines(firstOrderNodes, secondOrderNodes, secondOrderConnectionsMap),
    [firstOrderNodes, secondOrderNodes, secondOrderConnectionsMap]
  )

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
      <p className={styles.subtitle}>All nodes clustered by connections. Rotate the globe to explore.</p>

      <div className={styles.globeContainer}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />

          <Suspense fallback={null}>
            <CameraController nodePositions={allNodesForTextures} entryId={entryId} controlsRef={controlsRef} />

            <GradientGlobe />

            {/* First order connection lines */}
            {firstOrderConnectionLines}

            {/* Second order connection lines */}
            {secondOrderConnectionLines}

            {/* Main node */}
            {mainNode && (
              <SphereWithEffects
                key={mainNode.node.id}
                id={mainNode.node.id}
                pos={mainNode.position.toArray()}
                title={mainNode.node.title}
                size={DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION] * 0.5}
                mainTexture={nodeTextures.get(mainNode.node.id)}
                onClick={() => handleNodeClick(mainNode.node.id)}
                rotation={getSphereRotation(mainNode.position)}
              />
            )}

            {/* First order nodes */}
            {firstOrderNodes.map(({ node, position }) => {
              const texture = nodeTextures.get(node.id)
              const size = DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION] * 0.5

              return (
                <SphereWithEffects
                  key={node.id}
                  id={node.id}
                  pos={position.toArray()}
                  title={node.title}
                  size={size}
                  mainTexture={texture}
                  onClick={() => handleNodeClick(node.id)}
                  rotation={getSphereRotation(position)}
                />
              )
            })}

            {/* Second order nodes */}
            {secondOrderNodes.map(({ node, position }) => {
              const texture = nodeTextures.get(node.id)
              const size = DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION] * 0.3

              return (
                <SphereWithEffects
                  key={node.id}
                  id={node.id}
                  pos={position.toArray()}
                  title={node.title}
                  size={size}
                  mainTexture={texture}
                  onClick={() => handleNodeClick(node.id)}
                  rotation={getSphereRotation(position)}
                />
              )
            })}
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={12}
            onChange={handleCameraChange}
          />
        </Canvas>
      </div>

      <div className={styles.info}>
        <p>Clusters: {clusters.length}</p>
        <p>Total Nodes: {allNodesForTextures.length}</p>
        <p>First Order: {firstOrderNodes.length}</p>
        <p>Second Order: {secondOrderNodes.length}</p>
        <p>
          Camera: Azimuth {cameraRotation.azimuth} | Polar {cameraRotation.polar}
        </p>
      </div>
    </div>
  )
}

export default GlobalView
