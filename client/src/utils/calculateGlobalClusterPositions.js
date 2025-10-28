import * as THREE from 'three'
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'
import calculateSpherePositions from './calculateSpherePositions'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { transformConnection } from '@utils/transformConnection'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

/**
 * Place nodes within a cluster on the sphere surface using local explore positioning
 * @param {Array} cluster - Array of node IDs in this cluster
 * @param {THREE.Vector3} clusterCenter - Center position of the cluster on the sphere
 * @param {Array} nodeEntries - All node entries
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Array} - Array of { node, position } objects
 */
const placeNodesInCluster = async (cluster, clusterCenter, nodeEntries, dispatch) => {
  const positions = []

  // Get the outward normal from sphere center to cluster center
  const normal = clusterCenter.clone().normalize()

  // Create a local coordinate system on the sphere surface
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  // Fetch connections for the cluster main node
  const clusterMainNodeId = 1412
  const allConnections = await dispatch(fetchConnectionsDirect(clusterMainNodeId)).unwrap()

  console.log('<<<<<< allConnections >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(allConnections)

  // Use the same positioning logic as local explore view
  const localPositions = calculateSpherePositions(allConnections, { PARENT, EXTERNAL, CHILD, SIBLING })

  console.log('<<<<<< localPositions >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(localPositions)

  // Scale factor to bring nodes closer to center
  const positionScale = 0.2

  // Add the main/center node at the cluster center
  const mainNode = nodeEntries.find((n) => n.id === clusterMainNodeId)
  if (mainNode) {
    positions.push({ node: mainNode, position: clusterCenter })
  } else {
    // Create placeholder for main node if not found
    const placeholderMainNode = {
      id: clusterMainNodeId,
      title: `Main Node ${clusterMainNodeId}`,
      content: 'Main node placeholder content',
      date_last_modified: new Date(),
    }
    positions.push({ node: placeholderMainNode, position: clusterCenter })
  }

  // Map each connection to its node and project local position onto sphere
  allConnections.forEach((conn) => {
    const localPos = localPositions.positions[conn.id]
    if (!localPos) return

    const nodeId = conn.primary_entry_id === clusterMainNodeId ? conn.foreign_entry_id : conn.primary_entry_id

    const transformed = transformConnection(clusterMainNodeId, conn)

    // Create node from connection data with placeholder content
    const node = {
      id: transformed.id,
      title: transformed.title,
      content: 'asdlfkjasd;liur as;dfa IIIIII JFADDLLK JRE AIDLASDLKJ GED ???',
      date_last_modified: new Date(),
    }

    // Convert local 2D position to 3D position on sphere surface
    // localPos is [x, y, z] where z is typically 0
    const [localX, localY] = localPos

    // Scale down the local positions to bring nodes closer together
    const scaledX = localX * positionScale
    const scaledY = localY * positionScale

    // Project onto sphere using local coordinate system
    const worldPos = clusterCenter.clone()
    worldPos.x += tangent1.x * scaledX + tangent2.x * scaledY
    worldPos.y += tangent1.y * scaledX + tangent2.y * scaledY
    worldPos.z += tangent1.z * scaledX + tangent2.z * scaledY

    // Normalize and scale to sphere radius
    worldPos.normalize().multiplyScalar(clusterCenter.length())

    positions.push({ node, position: worldPos })
  })

  console.log('<<<<<< Final positions count:', positions.length)

  return positions
}

export default placeNodesInCluster
