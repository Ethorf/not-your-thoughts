import React from 'react'
import * as THREE from 'three'
import extractTextFromHTML from './extractTextFromHTML'
import calculateGlobalClusterPositions, { positionNodeConnections } from './calculateGlobalClusterPositions'
import { resolvePositionOriginal } from './resolvePositionOriginal'
import { resolvePositionWithOverlapPrevention } from './resolvePositionWithOverlapPrevention'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { transformConnection } from '@utils/transformConnection'
import { transformBackendToFrontendConnectionType } from './connectionTypeHelpers'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

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
 * Find the node within a cluster that has the most connections (to other nodes in the same cluster)
 * @param {Array} cluster - Array of node IDs in the cluster
 * @param {Map} adjacency - Map of nodeId -> array of connected node IDs
 * @returns {number|null} The node ID with the most connections, or null if cluster is empty
 */
export const getClusterHubNode = (cluster, adjacency) => {
  if (!cluster?.length || !adjacency) return null

  const clusterSet = new Set(cluster)
  let maxConnections = -1
  let hubNodeId = null

  cluster.forEach((nodeId) => {
    const neighbors = adjacency.get(nodeId) || []
    const connectionsWithinCluster = neighbors.filter((n) => clusterSet.has(n)).length

    if (connectionsWithinCluster > maxConnections) {
      maxConnections = connectionsWithinCluster
      hubNodeId = nodeId
    }
  })

  return hubNodeId
}

/**
 * Position nodes in clusters for Global View
 * @param {Array} nodeEntriesInfo - Array of node entry info objects
 * @param {Array} allConnections - Array of all connections
 * @param {Array} clusters - Array of clusters (arrays of node IDs)
 * @param {Function} dispatch - Redux dispatch function
 * @param {number} targetNodeId - The main node ID to center on
 * @param {THREE.Vector3} [clusterCenterOverride] - Optional center position for this cluster on the globe
 * @returns {Promise<Object>} Promise resolving to { allNodePositions: Array, connectionsMap: Map }
 */
export const positionGlobalNodes = async (
  nodeEntriesInfo,
  allConnections,
  clusters,
  dispatch,
  targetNodeId,
  clusterCenterOverride = null
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
  const mainClusterSet = new Set(mainCluster)

  const radius = 3
  const clusterCenter =
    clusterCenterOverride && clusterCenterOverride instanceof THREE.Vector3
      ? clusterCenterOverride
      : new THREE.Vector3(radius, 0, 0)

  // Validate clusterCenter before calling
  if (!clusterCenter || !(clusterCenter instanceof THREE.Vector3)) {
    console.warn('Invalid clusterCenter for main cluster')
    return { allNodePositions: [], connectionsMap: new Map() }
  }

  const positions = await calculateGlobalClusterPositions(
    mainCluster,
    clusterCenter,
    nodeEntriesInfo,
    dispatch,
    targetNodeId
  )

  // Track all connections for line drawing
  const connectionsMap = new Map() // Map of nodeId -> Set of connected node IDs

  // Track seen node IDs and positions
  const seenNodeIds = new Set()
  const existingPositions = new Map() // Map of nodeId -> position
  const firstOrderNodeIds = new Set() // Track 1st order connections (direct to target node)
  const firstOrderConnectionTypes = new Map() // Map of first-order nodeId -> connection_type
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

  // Precompute connection types for first-order nodes relative to the main node
  // Transform backend types (horizontal/vertical) to frontend types (sibling/child/parent)
  allConnections.forEach((conn) => {
    const isMainToOther =
      (conn.entry_id === centerNodeId && firstOrderNodeIds.has(conn.foreign_entry_id)) ||
      (conn.foreign_entry_id === centerNodeId && firstOrderNodeIds.has(conn.entry_id))

    if (!isMainToOther) return

    const otherNodeId = conn.entry_id === centerNodeId ? conn.foreign_entry_id : conn.entry_id
    // Transform backend connection type to frontend type
    const frontendType = transformBackendToFrontendConnectionType(conn.connection_type, centerNodeId, conn)
    // If there happen to be multiple connections, last one wins – that's fine for type categorization
    if (frontendType) {
      firstOrderConnectionTypes.set(otherNodeId, frontendType)
    }
  })

  // Expand sub-connections: build additional orders of connections
  const maxExpandDepth = 3 // 0 = first-order only, 1 = second-order, 2 = third-order, 3 = fourth-order
  const isExternalNodeId = (nodeId) => typeof nodeId === 'string' && nodeId.startsWith('external-')
  let nodesToExpand = positions
    .map(({ node }) => node)
    .filter((node) => node.id !== targetNodeId && !isExternalNodeId(node.id))

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
  const connectionTypeMap = new Map()
  const setConnectionType = (fromId, toId, connectionType) => {
    if (!connectionType) return
    if (!connectionTypeMap.has(fromId)) {
      connectionTypeMap.set(fromId, new Map())
    }
    connectionTypeMap.get(fromId).set(toId, connectionType)
  }

  // Track connections from main node
  const mainNodePositions = positions.filter(({ node }) => node.id !== centerNodeId)
  mainNodePositions.forEach(({ node }) => {
    addConnection(targetNodeId, node.id)
    setConnectionType(targetNodeId, node.id, firstOrderConnectionTypes.get(node.id))
  })

  // Compute a stable left/right basis from the main cluster center
  const mainNormal = clusterCenter.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const mainTangent1 = new THREE.Vector3().crossVectors(northPole, mainNormal).normalize() // left/right axis

  // Position connections for each node with smaller scale to prevent overlaps
  for (let depth = 0; depth < maxExpandDepth; depth += 1) {
    if (!nodesToExpand.length) break

    const nextQueue = []

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
      subPositions.forEach(({ node, connectionType }) => {
        addConnection(nodeToExpand.id, node.id)
        setConnectionType(nodeToExpand.id, node.id, connectionType)
      })

      // Only add nodes we haven't seen yet
      // Use overlap prevention only for first expansion layer
      const shouldPreventOverlap = depth === 0 && firstOrderNodeIds.has(nodeToExpand.id)
      const isWestOfMain = biasSignX < 0

      subPositions.forEach(({ node, position, connectionType }) => {
        // Only add nodes that belong to this cluster (prevents cross-cluster duplication)
        const isInCluster = isExternalNodeId(node.id) || mainClusterSet.has(node.id)
        if (!isInCluster || seenNodeIds.has(node.id)) return

        {
          const finalPosition = shouldPreventOverlap
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
          allNodePositions.push({ node, position: finalPosition, connectionType: connectionType || null })
          if (!isExternalNodeId(node.id)) {
            nextQueue.push(node)
          }
        }
      })
    }

    nodesToExpand = nextQueue
  }

  // Separate nodes by order
  const mainNode = allNodePositions.find(({ node }) => node.id === targetNodeId)
  let firstOrderNodes = allNodePositions
    .filter(({ node }) => firstOrderNodeIds.has(node.id))
    .map((entry) => {
      const explicitType = firstOrderConnectionTypes.get(entry.node.id)
      const derivedExternal =
        entry.connectionType === EXTERNAL ||
        (typeof entry.node.id === 'string' && entry.node.id.startsWith('external-'))
          ? EXTERNAL
          : null
      return {
        ...entry,
        // Attach connection type to each first-order node for downstream use (e.g., rendering layers)
        connectionType: explicitType || derivedExternal,
      }
    })
  const secondOrderNodes = allNodePositions.filter(
    ({ node }) => node.id !== targetNodeId && !firstOrderNodeIds.has(node.id)
  )

  // Separate connection maps
  const firstOrderConnectionsMap = new Map()
  const secondOrderConnectionsMap = new Map()

  // Build first order connections (main node to first order nodes)
  if (mainNode) {
    firstOrderNodes.forEach(({ node }) => {
      if (connectionsMap.has(targetNodeId) && connectionsMap.get(targetNodeId).has(node.id)) {
        if (!firstOrderConnectionsMap.has(targetNodeId)) {
          firstOrderConnectionsMap.set(targetNodeId, new Set())
        }
        if (!firstOrderConnectionsMap.has(node.id)) {
          firstOrderConnectionsMap.set(node.id, new Set())
        }
        firstOrderConnectionsMap.get(targetNodeId).add(node.id)
        firstOrderConnectionsMap.get(node.id).add(targetNodeId)
      }
    })
  }

  // Add external connections as first-order nodes (they don't have entries in nodeEntriesInfo)
  const externalConnections = allConnections.filter((conn) => {
    return (
      conn.connection_type === EXTERNAL && (conn.entry_id === targetNodeId || conn.foreign_entry_id === targetNodeId)
    )
  })

  if (mainNode && externalConnections.length > 0) {
    const externalNodes = externalConnections
      .map((conn) => {
        const transformed = transformConnection(targetNodeId, conn)
        const externalId = `external-${conn.id}`
        if (seenNodeIds.has(externalId)) {
          return null
        }

        const node = {
          id: externalId,
          title: transformed.title,
          content: transformed.title,
          url: transformed.url,
          date_last_modified: new Date(),
        }

        return {
          node,
          position: mainNode.position,
          connectionType: EXTERNAL,
        }
      })
      .filter(Boolean)

    if (!externalNodes.length) {
      // Externals already included via initial positioning.
    } else {
      firstOrderNodes = [...firstOrderNodes, ...externalNodes]

      if (!firstOrderConnectionsMap.has(targetNodeId)) {
        firstOrderConnectionsMap.set(targetNodeId, new Set())
      }

      externalNodes.forEach(({ node }) => {
        if (!firstOrderConnectionsMap.has(node.id)) {
          firstOrderConnectionsMap.set(node.id, new Set())
        }
        firstOrderConnectionsMap.get(targetNodeId).add(node.id)
        firstOrderConnectionsMap.get(node.id).add(targetNodeId)
        addConnection(targetNodeId, node.id)
        setConnectionType(targetNodeId, node.id, EXTERNAL)
        setConnectionType(node.id, targetNodeId, EXTERNAL)
        seenNodeIds.add(node.id)
      })
    }
  }

  // Build second order connections (connections between first and second order nodes)
  firstOrderNodes.forEach(({ node: firstOrderNode }) => {
    const connectedNodes = connectionsMap.get(firstOrderNode.id) || new Set()
    connectedNodes.forEach((connectedNodeId) => {
      // If the connected node is a second order node, add to second order connections
      if (secondOrderNodes.some(({ node }) => node.id === connectedNodeId)) {
        if (!secondOrderConnectionsMap.has(firstOrderNode.id)) {
          secondOrderConnectionsMap.set(firstOrderNode.id, new Set())
        }
        if (!secondOrderConnectionsMap.has(connectedNodeId)) {
          secondOrderConnectionsMap.set(connectedNodeId, new Set())
        }
        secondOrderConnectionsMap.get(firstOrderNode.id).add(connectedNodeId)
        secondOrderConnectionsMap.get(connectedNodeId).add(firstOrderNode.id)
      }
    })
  })

  // Attach second-order nodes to their first-order parent entry (relative rendering)
  const secondOrderById = new Map(secondOrderNodes.map((entry) => [entry.node.id, entry]))
  const firstOrderNodesWithSecondOrder = firstOrderNodes.map((entry) => {
    const connected = secondOrderConnectionsMap.get(entry.node.id) || new Set()
    const attachedSecondOrder = []

    connected.forEach((connectedId) => {
      const secondOrderEntry = secondOrderById.get(connectedId)
      if (secondOrderEntry) {
        attachedSecondOrder.push(secondOrderEntry)
      }
    })

    return {
      ...entry,
      secondOrderNodes: attachedSecondOrder,
    }
  })

  // Attach connected nodes to each entry for recursive rendering
  // Include all expanded nodes so deeper orders can render.
  const nodeEntryById = new Map()
  const seedEntries = [...allNodePositions, mainNode, ...firstOrderNodesWithSecondOrder].filter(Boolean)
  seedEntries.forEach((entry) => {
    nodeEntryById.set(entry.node.id, entry)
  })
  const allRenderableNodes = [...nodeEntryById.values()]
  const withConnectedNodes = allRenderableNodes.map((entry) => {
    const connectedIds = connectionsMap.get(entry.node.id) || new Set()
    const connectedNodes = [...connectedIds]
      .map((id) => {
        const baseEntry = nodeEntryById.get(id)
        if (!baseEntry) return null
        const edgeType = connectionTypeMap.get(entry.node.id)?.get(id)
        if (!edgeType) return baseEntry
        return {
          ...baseEntry,
          connectionType: edgeType,
        }
      })
      .filter(Boolean)
    return {
      ...entry,
      connectedNodes,
    }
  })
  const withConnectedById = new Map(withConnectedNodes.map((entry) => [entry.node.id, entry]))
  const mainNodeWithConnected = mainNode ? withConnectedById.get(mainNode.node.id) || mainNode : null
  const firstOrderNodesFinal = firstOrderNodesWithSecondOrder.map(
    (entry) => withConnectedById.get(entry.node.id) || entry
  )
  const secondOrderNodesFinal = secondOrderNodes.map((entry) => withConnectedById.get(entry.node.id) || entry)

  const renderOwnerMap = {}
  if (mainNodeWithConnected?.node?.id) {
    const visited = new Set([mainNodeWithConnected.node.id])
    const queue = [mainNodeWithConnected.node.id]
    while (queue.length) {
      const currentId = queue.shift()
      const neighbors = connectionsMap.get(currentId) || new Set()
      neighbors.forEach((neighborId) => {
        if (visited.has(neighborId)) return
        visited.add(neighborId)
        renderOwnerMap[neighborId] = currentId
        queue.push(neighborId)
      })
    }
  }

  return {
    mainNode: mainNodeWithConnected || null,
    firstOrderNodes: firstOrderNodesFinal,
    secondOrderNodes: secondOrderNodesFinal,
    firstOrderConnectionsMap,
    secondOrderConnectionsMap,
    renderOwnerMap,
    allNodePositions, // Keep for backward compatibility if needed
    connectionsMap, // Keep for backward compatibility if needed
  }
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
 * Build connection lines between main node and a specific set of first-order nodes
 * @param {Object} mainNode - Main node object with { node, position }
 * @param {Array} targetNodes - Array of first order node objects to draw lines to
 * @param {Map} firstOrderConnectionsMap - Map of nodeId -> Set of connected node IDs
 * @returns {Array} Array of React line elements
 */
export const buildConnectionLinesForNodes = (mainNode, targetNodes, firstOrderConnectionsMap) => {
  if (!mainNode || !targetNodes?.length) return []

  const lines = []
  const drawnConnections = new Set()
  const allNodes = [mainNode, ...targetNodes]

  allNodes.forEach(({ node, position: posA }) => {
    const connectedNodes = firstOrderConnectionsMap.get(node.id) || new Set()

    connectedNodes.forEach((connectedNodeId) => {
      // Only draw lines to nodes in our target set (or to main node)
      const isTargetNode = targetNodes.some((n) => n.node.id === connectedNodeId)
      const isMainNode = connectedNodeId === mainNode.node.id

      if (!isTargetNode && !isMainNode) return

      const connectionKey = [node.id, connectedNodeId].sort().join('-')

      if (drawnConnections.has(connectionKey)) {
        return
      }

      drawnConnections.add(connectionKey)

      const connectedNode = allNodes.find(({ node: n }) => n.id === connectedNodeId)
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
 * Build first order connection lines (main node to first order nodes)
 * @param {Object} mainNode - Main node object with { node, position }
 * @param {Array} firstOrderNodes - Array of first order node objects
 * @param {Map} firstOrderConnectionsMap - Map of nodeId -> Set of connected node IDs
 * @returns {Array} Array of React line elements
 * @deprecated Use buildConnectionLinesForNodes instead for type-specific rendering
 */
export const buildFirstOrderConnectionLines = (mainNode, firstOrderNodes, firstOrderConnectionsMap) => {
  return buildConnectionLinesForNodes(mainNode, firstOrderNodes, firstOrderConnectionsMap)
}

/**
 * Build second order connection lines (first order to second order nodes)
 * @param {Array} firstOrderNodes - Array of first order node objects
 * @param {Array} secondOrderNodes - Array of second order node objects
 * @param {Map} secondOrderConnectionsMap - Map of nodeId -> Set of connected node IDs
 * @returns {Array} Array of React line elements
 */
export const buildSecondOrderConnectionLines = (firstOrderNodes, secondOrderNodes, secondOrderConnectionsMap) => {
  const lines = []
  const drawnConnections = new Set()
  const allNodes = [...firstOrderNodes, ...secondOrderNodes]

  allNodes.forEach(({ node, position: posA }) => {
    const connectedNodes = secondOrderConnectionsMap.get(node.id) || new Set()

    connectedNodes.forEach((connectedNodeId) => {
      const connectionKey = [node.id, connectedNodeId].sort().join('-')

      if (drawnConnections.has(connectionKey)) {
        return
      }

      drawnConnections.add(connectionKey)

      const connectedNode = allNodes.find(({ node: n }) => n.id === connectedNodeId)
      if (!connectedNode) return

      const posB = connectedNode.position
      const points = [new THREE.Vector3(posA.x, posA.y, posA.z), new THREE.Vector3(posB.x, posB.y, posB.z)]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      lines.push(
        <line key={connectionKey} geometry={geometry}>
          <lineBasicMaterial color="white" opacity={0.5} />
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
