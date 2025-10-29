import * as THREE from 'three'
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'
import calculateSpherePositions from './calculateSpherePositions'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { transformConnection } from '@utils/transformConnection'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

/**
 * Position connections for a node at a given position on the sphere
 * @param {number} nodeId - ID of the node to fetch connections for
 * @param {THREE.Vector3} nodePosition - Position of the node on the sphere
 * @param {Array} nodeEntries - All node entries
 * @param {Function} dispatch - Redux dispatch function
 * @param {number} positionScale - Scale factor for positioning (default 0.2)
 * @returns {Array} - Array of { node, position } objects
 */
export const positionNodeConnections = async (nodeId, nodePosition, nodeEntries, dispatch, positionScale = 0.2) => {
  // Validate nodePosition
  if (!nodePosition || !(nodePosition instanceof THREE.Vector3) || nodePosition.length() === 0) {
    return []
  }

  const positions = []
  const normal = nodePosition.clone().normalize()

  // Create a local coordinate system on the sphere surface
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  // Fetch connections for the node
  const allConnections = await dispatch(fetchConnectionsDirect(nodeId)).unwrap()

  // Use the same positioning logic as local explore view
  const localPositions = calculateSpherePositions(allConnections, { PARENT, EXTERNAL, CHILD, SIBLING })

  // Map each connection to its node and project local position onto sphere
  allConnections.forEach((conn) => {
    const localPos = localPositions.positions[conn.id]
    if (!localPos) return

    const transformed = transformConnection(nodeId, conn)

    // Find the node entry to get correct title and content
    const node = nodeEntries.find((n) => n.id === transformed.id) || {
      // Fallback to connection data if node not found
      id: transformed.id,
      title: transformed.title,
      content: 'Gorem japsdifasdlkj asdfasdfads',
      date_last_modified: new Date(),
    }

    // Convert local 2D position to 3D position on sphere surface
    const [localX, localY] = localPos

    // Scale down the local positions
    const scaledX = localX * positionScale
    const scaledY = localY * positionScale

    // Project onto sphere using local coordinate system
    const worldPos = nodePosition.clone()
    worldPos.x += tangent1.x * scaledX + tangent2.x * scaledY
    worldPos.y += tangent1.y * scaledX + tangent2.y * scaledY
    worldPos.z += tangent1.z * scaledX + tangent2.z * scaledY

    // Normalize and scale to sphere radius
    worldPos.normalize().multiplyScalar(nodePosition.length())

    positions.push({ node, position: worldPos })
  })

  return positions
}

/**
 * Place nodes within a cluster on the sphere surface using local explore positioning
 * @param {Array} cluster - Array of node IDs in this cluster
 * @param {THREE.Vector3} clusterCenter - Center position of the cluster on the sphere
 * @param {Array} nodeEntries - All node entries
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Array} - Array of { node, position } objects
 */
const calculateGlobalClusterPositions = async (cluster, clusterCenter, nodeEntries, dispatch) => {
  // CRITICAL: Validate clusterCenter FIRST before any operations
  if (!clusterCenter || !(clusterCenter instanceof THREE.Vector3)) {
    console.warn('calculateGlobalClusterPositions: clusterCenter is undefined or not a Vector3', { clusterCenter })
    return []
  }

  // Check for zero-length vector (cannot be normalized)
  if (clusterCenter.length() === 0) {
    console.warn('calculateGlobalClusterPositions: clusterCenter has zero length', { clusterCenter })
    return []
  }

  const positions = []

  // Get the outward normal from sphere center to cluster center
  // Now we know clusterCenter is valid, so no need for optional chaining
  const normal = clusterCenter.clone().normalize()

  // Validate normal after normalization
  if (!normal || !isFinite(normal.x) || !isFinite(normal.y) || !isFinite(normal.z)) {
    console.warn('calculateGlobalClusterPositions: invalid normal after normalization', { clusterCenter, normal })
    return []
  }

  // Create a local coordinate system on the sphere surface
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  // Fetch connections for the cluster main node
  const clusterMainNodeId = 990

  // Add the main/center node at the cluster center
  const mainNode = nodeEntries.find((n) => n.id === clusterMainNodeId)
  console.log('<<<<<< mainNode >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(mainNode)
  if (mainNode) {
    positions.push({ node: mainNode, position: clusterCenter })
  }

  // Use the reusable function to position connections
  const connectionPositions = await positionNodeConnections(
    clusterMainNodeId,
    clusterCenter,
    nodeEntries,
    dispatch,
    0.2
  )
  positions.push(...connectionPositions)

  return positions
}

export default calculateGlobalClusterPositions
