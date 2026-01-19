import React from 'react'
import * as THREE from 'three'
import extractTextFromHTML from './extractTextFromHTML'
import calculateGlobalClusterPositions, { positionNodeConnections } from './calculateGlobalClusterPositions'
import { resolvePositionOriginal } from './resolvePositionOriginal'
import { resolvePositionWithOverlapPrevention } from './resolvePositionWithOverlapPrevention'

/**
 * Generate cluster positions on a sphere using Poisson-like distribution
 * @param {number} numClusters - Number of clusters to generate
 * @param {number} radius - Radius of the sphere (default: 3)
 * @returns {Array} Array of THREE.Vector3 positions
 */
export const generateClusterPositions = (numClusters, radius = 3) => {
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

/**
 * Build graph and find connected components (clusters)
 * @param {Array} nodeEntries - Array of node objects
 * @param {Array} connections - Array of connection objects with entry_id and foreign_entry_id
 * @returns {Object} Object with { clusters: Array, adjacency: Map }
 */
export const buildClusters = (nodeEntries, connections) => {
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

/**
 * Position nodes in clusters for Global View
 * @param {Array} nodeEntriesInfo - Array of node entry info objects
 * @param {Array} allConnections - Array of all connections
 * @param {Array} clusters - Array of clusters (arrays of node IDs)
 * @param {Function} dispatch - Redux dispatch function
 * @param {number} targetNodeId - The main node ID to center on (default: 990)
 * @returns {Promise<Object>} Promise resolving to { allNodePositions: Array, connectionsMap: Map }
 */
export const positionGlobalNodes = async (
  nodeEntriesInfo,
  allConnections,
  clusters,
  dispatch,
  targetNodeId = 990
) => {
  if (!nodeEntriesInfo || !allConnections || clusters.length === 0) {
    return { allNodePositions: [], connectionsMap: new Map() }
  }

  // Find which cluster contains the target node (the main cluster)
  const mainNodeClusterIndex = clusters.findIndex((cluster) => cluster.includes(targetNodeId))

  // Only process the cluster containing the target node
  if (mainNodeClusterIndex === -1) {
    console.warn(`Node ${targetNodeId} not found in any cluster`)
    return { allNodePositions: [], connectionsMap: new Map() }
  }

  const allNodePositions = []
  const mainCluster = clusters[mainNodeClusterIndex]

  // Position the main cluster at the equator
  const radius = 3
  const clusterCenter = new THREE.Vector3(radius, 0, 0)

  // Validate clusterCenter before calling
  if (!clusterCenter || !(clusterCenter instanceof THREE.Vector3)) {
    console.warn('Invalid clusterCenter for main cluster')
    return { allNodePositions: [], connectionsMap: new Map() }
  }

  const positions = await calculateGlobalClusterPositions(mainCluster, clusterCenter, nodeEntriesInfo, dispatch)

  // Track all connections for line drawing
  const connectionsMap = new Map() // Map of nodeId -> Set of connected node IDs

  // Track seen node IDs and positions
  const seenNodeIds = new Set()
  const existingPositions = new Map() // Map of nodeId -> position
  const firstOrderNodeIds = new Set() // Track 1st order connections (direct to target node)
  const minDistance = 0.4 // Minimum distance to check for overlaps

  // Add initial positions, preserving center node at clusterCenter
  const centerNodeId = targetNodeId
  positions.forEach(({ node, position }) => {
    // Always keep center node at exact cluster center
    if (node.id === centerNodeId) {
      seenNodeIds.add(node.id)
      existingPositions.set(node.id, clusterCenter)
      allNodePositions.push({ node, position: clusterCenter })
    } else {
      // Mark as 1st order connection
      firstOrderNodeIds.add(node.id)
      seenNodeIds.add(node.id)
      existingPositions.set(node.id, position)
      allNodePositions.push({ node, position })
    }
  })

  // Expand sub-connections: for each node (excluding target node), position its connections
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

  // Track connections from main node
  const mainNodePositions = positions.filter(({ node }) => node.id !== centerNodeId)
  mainNodePositions.forEach(({ node }) => {
    addConnection(targetNodeId, node.id)
  })

  // Compute a stable left/right basis from the main cluster center
  const mainNormal = clusterCenter.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const mainTangent1 = new THREE.Vector3().crossVectors(northPole, mainNormal).normalize() // left/right axis

  // Position connections for each node with smaller scale to prevent overlaps
  for (const nodeToExpand of nodesToExpand) {
    const nodePosition = existingPositions.get(nodeToExpand.id)

    if (!nodePosition) continue

    // Determine which side (left/right) this node is on relative to the main center
    const deltaFromCenter = nodePosition.clone().sub(clusterCenter)
    const biasSignX = Math.sign(deltaFromCenter.dot(mainTangent1)) || 1

    const subPositions = await positionNodeConnections(
      nodeToExpand.id,
      nodePosition,
      nodeEntriesInfo,
      dispatch,
      0.25, // Increased scale for sub-connections to add more spacing
      { biasSignX, suppressFirstChildBias: true }
    )

    // Track connections for this node
    subPositions.forEach(({ node }) => {
      addConnection(nodeToExpand.id, node.id)
    })

    // Only add nodes we haven't seen yet
    // Check if nodeToExpand is 1st order to determine if these are 2nd order connections
    const isSecondOrder = firstOrderNodeIds.has(nodeToExpand.id)
    const isWestOfMain = biasSignX < 0

    subPositions.forEach(({ node, position }) => {
      if (!seenNodeIds.has(node.id)) {
        // Use overlap prevention for 2nd order connections, original positioning for others
        const finalPosition = isSecondOrder
          ? resolvePositionWithOverlapPrevention(
              position,
              nodePosition,
              isWestOfMain,
              clusterCenter,
              existingPositions.values(),
              minDistance
            )
          : resolvePositionOriginal(position)

        seenNodeIds.add(node.id)
        existingPositions.set(node.id, finalPosition)
        allNodePositions.push({ node, position: finalPosition })
      }
    })
  }

  return { allNodePositions, connectionsMap }
}

/**
 * Build connection lines between nodes for Global View
 * @param {Array} nodePositions - Array of objects with { node, position }
 * @param {Map} allConnectionsMap - Map of nodeId -> Set of connected node IDs
 * @returns {Array} Array of React line elements
 */
export const buildGlobalConnectionLines = (nodePositions, allConnectionsMap) => {
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
}

/**
 * Build node textures from node positions for Global View
 * @param {Array} nodePositions - Array of objects with { node, position }
 * @returns {Map} Map of nodeId -> THREE.CanvasTexture
 */
export const buildGlobalNodeSphereTextures = (nodePositions) => {
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
}
