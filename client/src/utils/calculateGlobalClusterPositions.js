import * as THREE from 'three'
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'
import calculateSpherePositions from './calculateSpherePositions'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import axiosInstance from '@utils/axiosInstance'
import { transformConnection } from '@utils/transformConnection'
import { transformBackendToFrontendConnectionType } from './connectionTypeHelpers'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const cachedNodeEntries = new Map()
const inflightNodeEntryRequests = new Map()

const fetchNodeEntryById = async (entryId) => {
  if (!entryId) return null
  if (cachedNodeEntries.has(entryId)) return cachedNodeEntries.get(entryId)
  if (inflightNodeEntryRequests.has(entryId)) return inflightNodeEntryRequests.get(entryId)

  const request = axiosInstance
    .get(`api/entries/entry/${entryId}`)
    .then((response) => {
      const entry = response.data || {}
      const normalizedEntry = {
        id: entry.id ?? entryId,
        title: entry.title || 'Untitled',
        content: Array.isArray(entry.content) ? entry.content[0] : entry.content,
        date_last_modified: entry.date_last_updated || entry.date_last_modified || new Date(),
      }
      cachedNodeEntries.set(entryId, normalizedEntry)
      inflightNodeEntryRequests.delete(entryId)
      return normalizedEntry
    })
    .catch(() => {
      inflightNodeEntryRequests.delete(entryId)
      return null
    })

  inflightNodeEntryRequests.set(entryId, request)
  return request
}

/**
 * Position connections for a node at a given position on the sphere
 * @param {number} nodeId - ID of the node to fetch connections for
 * @param {THREE.Vector3} nodePosition - Position of the node on the sphere
 * @param {Array} nodeEntries - All node entries
 * @param {Function} dispatch - Redux dispatch function
 * @param {number} positionScale - Scale factor for positioning (default 0.2)
 * @returns {Array} - Array of { node, position } objects
 */
export const positionNodeConnections = async (
  nodeId,
  nodePosition,
  nodeEntries,
  dispatch,
  positionScale = 0.2,
  options = {}
) => {
  if (typeof nodeId !== 'number') {
    return []
  }
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
  const rawConnections = await dispatch(fetchConnectionsDirect(nodeId)).unwrap()
  const allConnections = Array.isArray(rawConnections) ? rawConnections : []
  const normalizedConnections = allConnections
    .map((conn) => ({
      ...conn,
      connection_type: transformBackendToFrontendConnectionType(conn.connection_type, nodeId, conn),
    }))
    .filter((conn) => conn.connection_type)

  // Use the same positioning logic as local explore view
  const localPositions = calculateSpherePositions(normalizedConnections, { PARENT, EXTERNAL, CHILD, SIBLING })

  // Map each connection to its node and project local position onto sphere
  let firstChildHandled = false
  const enrichedConnections = await Promise.all(
    normalizedConnections.map(async (conn) => {
      if (conn.connection_type === EXTERNAL) {
        const externalId = `external-${conn.id}`
        const title = conn.primary_source || conn.foreign_source || 'External Link'
        const node = {
          id: externalId,
          title,
          content: title,
          url: conn.foreign_source,
          date_last_modified: new Date(),
        }
        return { conn, node }
      }

      const transformed = transformConnection(nodeId, conn)
      const matchingEntry = nodeEntries.find((n) => n.id === transformed.id)
      const fetchedEntry = matchingEntry ? null : await fetchNodeEntryById(transformed.id)

      const node = matchingEntry ||
        fetchedEntry || {
          // Fallback to connection data if node not found
          id: transformed.id,
          title: transformed.title,
          content: transformed.title,
          date_last_modified: new Date(),
        }

      return {
        conn,
        node,
      }
    })
  )

  enrichedConnections.forEach(({ conn, node }) => {
    const localPos = localPositions.positions[conn.id]
    if (!localPos) return

    // Convert local 2D position to 3D position on sphere surface
    const [localX, localY] = localPos

    // Apply side bias if provided to keep siblings on the same lateral side
    const baseBias =
      typeof options.biasSignX === 'number' && options.biasSignX !== 0 ? Math.sign(options.biasSignX) : null
    const isChildConn = conn.connection_type === CHILD
    const suppressFirstChildBias = !!options.suppressFirstChildBias
    const effectiveBias = suppressFirstChildBias && isChildConn && !firstChildHandled ? null : baseBias
    if (suppressFirstChildBias && isChildConn && !firstChildHandled) {
      firstChildHandled = true
    }
    const biasedLocalX = effectiveBias ? Math.abs(localX) * effectiveBias : localX

    // Scale down the local positions
    const scaledX = biasedLocalX * positionScale
    const scaledY = localY * positionScale

    // Project onto sphere using local coordinate system
    const worldPos = nodePosition.clone()
    worldPos.x += tangent1.x * scaledX + tangent2.x * scaledY
    worldPos.y += tangent1.y * scaledX + tangent2.y * scaledY
    worldPos.z += tangent1.z * scaledX + tangent2.z * scaledY

    // Normalize and scale to sphere radius
    worldPos.normalize().multiplyScalar(nodePosition.length())

    // For 2nd order children, increase distance from parent along the radial direction (without affecting lateral position)
    const isSecondOrderChild = suppressFirstChildBias && isChildConn
    if (isSecondOrderChild) {
      const childDistanceMultiplier = 1.3 // Increase distance for 2nd order children (>1.0 = further away)
      // Calculate direction from parent to child (radial direction on sphere surface)
      const parentToChild = worldPos.clone().sub(nodePosition)
      const currentDistance = parentToChild.length()
      // Move child further from parent along the same direction, maintaining lateral position
      const radialDirection = parentToChild.normalize()
      const additionalOffset = radialDirection.multiplyScalar(currentDistance * (childDistanceMultiplier - 1.0))
      worldPos.add(additionalOffset)
      // Renormalize to stay on sphere surface
      worldPos.normalize().multiplyScalar(nodePosition.length())
    }

    positions.push({ node, position: worldPos, connectionType: conn.connection_type })
  })

  return positions
}

/**
 * Place nodes within a cluster on the sphere surface using local explore positioning
 * @param {Array} cluster - Array of node IDs in this cluster
 * @param {THREE.Vector3} clusterCenter - Center position of the cluster on the sphere
 * @param {Array} nodeEntries - All node entries
 * @param {Function} dispatch - Redux dispatch function
 * @param {number} centerNodeId - ID of the hub/main node to center the cluster around
 * @returns {Array} - Array of { node, position } objects
 */
const calculateGlobalClusterPositions = async (cluster, clusterCenter, nodeEntries, dispatch, centerNodeId) => {
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

  if (!centerNodeId) {
    console.warn('calculateGlobalClusterPositions: centerNodeId is required', { centerNodeId })
    return []
  }

  // Add the main/center node at the cluster center
  let mainNode = nodeEntries.find((n) => n.id === centerNodeId)
  if (!mainNode) {
    mainNode = await fetchNodeEntryById(centerNodeId)
  }
  if (mainNode) {
    positions.push({ node: mainNode, position: clusterCenter })
  }

  // Use the reusable function to position connections
  const connectionPositions = await positionNodeConnections(
    centerNodeId,
    clusterCenter,
    nodeEntries,
    dispatch,
    0.2
  )
  positions.push(...connectionPositions)

  return positions
}

export default calculateGlobalClusterPositions
