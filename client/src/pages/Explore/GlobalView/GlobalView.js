import React, { Suspense, useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
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

// Utils
import extractTextFromHTML from '@utils/extractTextFromHTML'
import placeNodesInCluster from '@utils/calculateGlobalClusterPositions'

// Poisson-ish distribution for cluster placement on sphere
const generateClusterPositions = (numClusters, radius = 3) => {
  const positions = []
  const minDistance = 0.8 // Minimum distance between clusters

  for (let i = 0; i < numClusters; i++) {
    let attempts = 0
    let validPosition = false
    let position = null

    while (!validPosition && attempts < 100) {
      // Generate random point on sphere
      const theta = Math.random() * Math.PI * 2 // Azimuth
      const phi = Math.acos(2 * Math.random() - 1) // Polar angle

      const candidatePosition = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      )

      // Check distance from existing positions
      const isValidDistance = positions.every((existingPos) => candidatePosition.distanceTo(existingPos) >= minDistance)

      if (isValidDistance) {
        position = candidatePosition
        validPosition = true
      }

      attempts++
    }

    if (position) {
      positions.push(position)
    }
  }

  return positions
}

// Build graph and find connected components (clusters). Return clusters and adjacency map.
const buildClusters = (nodeEntries, connections) => {
  const graph = new Map()
  const visited = new Set()
  const clusters = []

  // Build adjacency list
  nodeEntries.forEach((node) => {
    graph.set(node.id, [])
  })

  connections.forEach((conn) => {
    const source = conn.entry_id
    const target = conn.foreign_entry_id

    if (graph.has(source) && graph.has(target)) {
      graph.get(source).push(target)
      graph.get(target).push(source)
    }
  })

  // Find connected components using DFS
  const dfs = (nodeId, cluster) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    cluster.push(nodeId)

    const neighbors = graph.get(nodeId) || []
    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        dfs(neighborId, cluster)
      }
    })
  }

  nodeEntries.forEach((node) => {
    if (!visited.has(node.id)) {
      const cluster = []
      dfs(node.id, cluster)
      if (cluster.length > 0) {
        clusters.push(cluster)
      }
    }
  })

  return { clusters, adjacency: graph }
}

// Helper component to position camera to face a specific sphere
const CameraController = ({ nodePositions, entryId, controlsRef }) => {
  const { camera } = useThree()

  useEffect(() => {
    if (nodePositions.length > 0 && entryId && controlsRef.current) {
      const targetNodePosition = nodePositions.find(({ node }) => node.id === entryId)

      if (targetNodePosition) {
        const position = targetNodePosition.position

        // Calculate spherical coordinates to position camera
        const distance = camera.position.length()
        const phi = Math.atan2(position.x, position.z)
        const theta = Math.acos(position.y / position.length())

        // Set camera position to face the target sphere
        const newCameraPos = new THREE.Vector3(
          distance * Math.sin(theta) * Math.sin(phi),
          distance * Math.cos(theta),
          distance * Math.sin(theta) * Math.cos(phi)
        )

        camera.position.copy(newCameraPos)
        camera.lookAt(0, 0, 0)
        controlsRef.current.update()
      }
    }
  }, [nodePositions, entryId, camera, controlsRef])

  return null
}

// Globe mesh with gradient from north (blue) to south (white)
const GradientGlobe = () => {
  const meshRef = useRef()

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry
      const count = geometry.attributes.position.count
      const colors = new Float32Array(count * 3)

      for (let i = 0; i < count; i++) {
        const y = geometry.attributes.position.getY(i)
        const normalizedY = (y + 2.5) / 5 // Normalize from [-2.5, 2.5] to [0, 1]

        // Blue at north (top), white at south (bottom)
        const blue = new THREE.Color(0x4a90e2)
        const white = new THREE.Color(0xffffff)
        const color = new THREE.Color().lerpColors(white, blue, normalizedY)

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }
  }, [])

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshBasicMaterial wireframe={true} transparent opacity={0.3} vertexColors={true} />
    </mesh>
  )
}

const GlobalView = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const dispatch = useDispatch()

  const { allConnections } = useSelector((state) => state.connections)
  const { entryId } = useSelector((state) => state.currentEntry)
  const [cameraRotation, setCameraRotation] = useState({ azimuth: 0, polar: 0 })
  const [nodePositions, setNodePositions] = useState([])
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

    // ** DEBUG: Filter to only node 1412 and its connections
    const targetNodeId = 1412
    const filteredConnections = allConnections.filter(
      (conn) => conn.entry_id === targetNodeId || conn.foreign_entry_id === targetNodeId
    )
    const connectedNodeIds = new Set([targetNodeId])
    filteredConnections.forEach((conn) => {
      connectedNodeIds.add(conn.entry_id)
      connectedNodeIds.add(conn.foreign_entry_id)
    })
    const filteredNodes = nodeEntriesInfo.filter((node) => connectedNodeIds.has(node.id))

    const { clusters, adjacency } = buildClusters(filteredNodes, filteredConnections)

    return { clusters, adjacency }
  }, [nodeEntriesInfo, allConnections])

  // Handle async positioning of nodes in clusters
  useEffect(() => {
    const positionNodes = async () => {
      if (!nodeEntriesInfo || !allConnections || clusters.length === 0) {
        return
      }

      // ** DEBUG: Filter to only node 1412 and its connections
      const targetNodeId = 1412
      const filteredConnections = allConnections.filter(
        (conn) => conn.entry_id === targetNodeId || conn.foreign_entry_id === targetNodeId
      )
      const connectedNodeIds = new Set([targetNodeId])
      filteredConnections.forEach((conn) => {
        connectedNodeIds.add(conn.entry_id)
        connectedNodeIds.add(conn.foreign_entry_id)
      })
      const filteredNodes = nodeEntriesInfo.filter((node) => connectedNodeIds.has(node.id))

      // Find which cluster contains the main node
      const mainNodeClusterIndex = clusters.findIndex((cluster) => cluster.includes(targetNodeId))

      // Generate positions for non-main clusters
      const otherClustersCount = clusters.length - 1
      const clusterPositions = generateClusterPositions(otherClustersCount)

      const allNodePositions = []
      let otherClusterIndex = 0

      for (const [clusterIndex, cluster] of clusters.entries()) {
        let clusterCenter

        // If this is the main node's cluster, position it at the equator
        if (clusterIndex === mainNodeClusterIndex) {
          const radius = 3
          // Place at equator (y = 0) at x = radius, z = 0
          clusterCenter = new THREE.Vector3(radius, 0, 0)
        } else {
          // Use generated position for other clusters
          clusterCenter = clusterPositions[otherClusterIndex]
          otherClusterIndex++
        }

        const positions = await placeNodesInCluster(cluster, clusterCenter, filteredNodes, dispatch)
        allNodePositions.push(...positions)
      }

      setNodePositions(allNodePositions)
    }

    positionNodes()
  }, [nodeEntriesInfo, allConnections, clusters, dispatch])

  // Create texture for each node
  const nodeTextures = useMemo(() => {
    const textures = new Map()

    nodePositions.forEach(({ node }) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 512

      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (node.content) {
        const text = extractTextFromHTML(node.content)
        ctx.fillStyle = 'silver'
        ctx.font = '10px Syncopate'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const words = text.split(' ')
        let line = ''
        const maxWidth = canvas.width - 50
        const lines = []

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && i > 0) {
            lines.push(line.trim())
            line = words[i] + ' '
          } else {
            line = testLine
          }
        }
        lines.push(line.trim())

        const lineHeight = 20
        let y = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2

        lines.forEach((l) => {
          ctx.fillText(l, canvas.width / 2, y)
          y += lineHeight
        })
      }

      if (node.title) {
        // Truncate title to max 4 words, 2 words per line
        const words = node.title.split(' ')
        const truncatedWords = words.slice(0, 4)
        const needsEllipsis = words.length > 4

        const line1 = truncatedWords.slice(0, 2).join(' ')
        const line2Words = truncatedWords.slice(2, 4)
        const line2 = line2Words.length > 0 ? line2Words.join(' ') + (needsEllipsis ? '...' : '') : ''

        // Draw title with better visibility
        ctx.font = 'bold 18px Syncopate'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Add text shadow for better visibility
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2

        // Draw first line
        const yOffset = line2 ? -12 : 0
        ctx.fillText(line1, canvas.width / 2, canvas.height / 2 + yOffset)

        // Draw second line if exists
        if (line2) {
          ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 12)
        }

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      const tex = new THREE.CanvasTexture(canvas)
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      textures.set(node.id, tex)
    })

    return textures
  }, [nodePositions])

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
            <CameraController nodePositions={nodePositions} entryId={entryId} controlsRef={controlsRef} />

            {/* Globe sphere with gradient */}
            <GradientGlobe />

            {/* Simple connection lines - DEBUG: only for node 1412 */}
            {(() => {
              const targetNodeId = 1412
              const targetNode = nodePositions.find(({ node }) => node.id === targetNodeId)
              if (!targetNode) return null

              const neighbors = adjacency.get(targetNodeId) || []
              return neighbors.map((neighborId) => {
                const neighborNode = nodePositions.find(({ node }) => node.id === neighborId)
                if (!neighborNode) return null

                const posA = targetNode.position
                const posB = neighborNode.position
                const points = [new THREE.Vector3(posA.x, posA.y, posA.z), new THREE.Vector3(posB.x, posB.y, posB.z)]
                const geometry = new THREE.BufferGeometry().setFromPoints(points)

                return (
                  <line key={`line-${targetNodeId}-${neighborId}`} geometry={geometry}>
                    <lineBasicMaterial color="white" />
                  </line>
                )
              })
            })()}

            {/* Nodes */}
            {nodePositions.map(({ node, position }) => {
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
        <p>Total Nodes: {nodePositions.length}</p>
        <p>
          Camera: Azimuth {cameraRotation.azimuth} | Polar {cameraRotation.polar}
        </p>
      </div>
    </div>
  )
}

export default GlobalView
