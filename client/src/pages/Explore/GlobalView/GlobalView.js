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
import calculateGlobalClusterPositions, { positionNodeConnections } from '@utils/calculateGlobalClusterPositions'

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
  const [allConnectionsMap, setAllConnectionsMap] = useState(new Map()) // Map of nodeId -> Set of connected node IDs
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
      if (!nodeEntriesInfo || !allConnections || clusters.length === 0) {
        return
      }

      // Find which cluster contains node 990 (the main cluster)
      const targetNodeId = 990
      const mainNodeClusterIndex = clusters.findIndex((cluster) => cluster.includes(targetNodeId))

      // Only process the cluster containing node 990
      if (mainNodeClusterIndex === -1) {
        console.warn('Node 990 not found in any cluster')
        return
      }

      const allNodePositions = []
      const mainCluster = clusters[mainNodeClusterIndex]

      // Position the main cluster (containing node 990) at the equator
      const radius = 3
      const clusterCenter = new THREE.Vector3(radius, 0, 0)

      // Validate clusterCenter before calling
      if (!clusterCenter || !(clusterCenter instanceof THREE.Vector3)) {
        console.warn('Invalid clusterCenter for main cluster')
        return
      }

      const positions = await calculateGlobalClusterPositions(mainCluster, clusterCenter, nodeEntriesInfo, dispatch)

      // Track all connections for line drawing
      const connectionsMap = new Map() // Map of nodeId -> Set of connected node IDs

      // Track seen node IDs and positions to prevent duplicates and overlaps
      const seenNodeIds = new Set()
      const existingPositions = new Map() // Map of nodeId -> position
      const minDistance = 0.4 // Minimum distance between spheres to prevent overlap

      // Helper function to check if a position is too close to existing positions
      const isTooClose = (newPos) => {
        for (const existingPos of existingPositions.values()) {
          if (newPos.distanceTo(existingPos) < minDistance) {
            return true
          }
        }
        return false
      }

      // Helper function to find a non-overlapping position near the desired position
      const findNonOverlappingPosition = (desiredPos, maxAttempts = 10) => {
        if (!isTooClose(desiredPos)) {
          return desiredPos
        }

        // Try to find a nearby position that doesn't overlap
        const radius = clusterCenter.length()
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          // Generate a small random offset
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          )
          const candidatePos = desiredPos.clone().add(offset).normalize().multiplyScalar(radius)

          if (!isTooClose(candidatePos)) {
            return candidatePos
          }
        }

        // If we can't find a non-overlapping position, return the original (they'll overlap but at least won't crash)
        return desiredPos
      }

      // Add initial positions, preserving center node (990) at clusterCenter
      const centerNodeId = targetNodeId
      positions.forEach(({ node, position }) => {
        // Always keep center node at exact cluster center
        if (node.id === centerNodeId) {
          seenNodeIds.add(node.id)
          existingPositions.set(node.id, clusterCenter)
          allNodePositions.push({ node, position: clusterCenter })
        } else {
          // Check for overlaps with other nodes
          const finalPosition = findNonOverlappingPosition(position)
          seenNodeIds.add(node.id)
          existingPositions.set(node.id, finalPosition)
          allNodePositions.push({ node, position: finalPosition })
        }
      })

      // Expand sub-connections: for each node (excluding 990), position its connections
      const nodesToExpand = positions.map(({ node }) => node).filter((node) => node.id !== targetNodeId)

      // Helper function to add connection to map (bidirectional)
      const addConnection = (nodeId1, nodeId2) => {
        if (!connectionsMap.has(nodeId1)) {
          connectionsMap.set(nodeId1, new Set())
        }
        if (!connectionsMap.has(nodeId2)) {
          connectionsMap.set(nodeId2, new Set())
        }
        connectionsMap.get(nodeId1).add(nodeId2)
        connectionsMap.get(nodeId2).add(nodeId1)
      }

      // Track connections from main node (990)
      const mainNodePositions = positions.filter(({ node }) => node.id !== centerNodeId)
      mainNodePositions.forEach(({ node }) => {
        addConnection(targetNodeId, node.id)
      })

      // Position connections for each node with smaller scale to prevent overlaps
      for (const nodeToExpand of nodesToExpand) {
        const nodePosition = existingPositions.get(nodeToExpand.id)

        if (!nodePosition) continue

        const subPositions = await positionNodeConnections(
          nodeToExpand.id,
          nodePosition,
          nodeEntriesInfo,
          dispatch,
          0.15 // Smaller scale for sub-connections to reduce overlap
        )

        // Track connections for this node
        subPositions.forEach(({ node }) => {
          addConnection(nodeToExpand.id, node.id)
        })

        // Only add nodes we haven't seen yet and check for overlaps
        subPositions.forEach(({ node, position }) => {
          if (!seenNodeIds.has(node.id)) {
            const finalPosition = findNonOverlappingPosition(position)
            seenNodeIds.add(node.id)
            existingPositions.set(node.id, finalPosition)
            allNodePositions.push({ node, position: finalPosition })
          }
        })
      }

      console.log('<<<<<< allNodePositions >>>>>>>>> is: <<<<<<<<<<<<')
      console.log(allNodePositions)
      setNodePositions(allNodePositions)
      setAllConnectionsMap(connectionsMap)
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

            <GradientGlobe />

            {/* Connection lines for all nodes */}
            {(() => {
              const lines = []
              const drawnConnections = new Set() // Track already drawn connections to avoid duplicates

              nodePositions.forEach(({ node, position: posA }) => {
                const connectedNodes = allConnectionsMap.get(node.id) || new Set()

                connectedNodes.forEach((connectedNodeId) => {
                  // Create unique key for connection (bidirectional, so use sorted IDs)
                  const connectionKey = [node.id, connectedNodeId].sort().join('-')

                  if (drawnConnections.has(connectionKey)) {
                    return // Already drew this line
                  }

                  drawnConnections.add(connectionKey)

                  const connectedNode = nodePositions.find(({ node: n }) => n.id === connectedNodeId)
                  if (!connectedNode) return

                  const posB = connectedNode.position
                  const points = [new THREE.Vector3(posA.x, posA.y, posA.z), new THREE.Vector3(posB.x, posB.y, posB.z)]
                  const geometry = new THREE.BufferGeometry().setFromPoints(points)

                  lines.push(
                    <line key={connectionKey} geometry={geometry}>
                      <lineBasicMaterial color="white" />
                    </line>
                  )
                })
              })

              return lines
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
