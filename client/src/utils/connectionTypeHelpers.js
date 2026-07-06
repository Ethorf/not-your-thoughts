import { CONNECTION_TYPES } from '@constants/connectionTypes'

const {
  FRONTEND: { SIBLING, CHILD, PARENT, EXTERNAL },
  BACKEND: { HORIZONTAL, VERTICAL },
} = CONNECTION_TYPES

/**
 * Transform backend connection type (horizontal/vertical/external) to frontend type
 * (sibling/child/parent/external) based on the relationship to the main node.
 * If a frontend type is already provided, pass it through.
 * @param {string} backendType - Backend or frontend connection type
 * @param {number} mainNodeId - ID of the main node
 * @param {Object} connection - Connection object with entry_id and foreign_entry_id
 * @returns {string|null} Frontend connection type (sibling, child, parent, external)
 */
export const transformBackendToFrontendConnectionType = (backendType, mainNodeId, connection) => {
  if (backendType === SIBLING || backendType === CHILD || backendType === PARENT) {
    return backendType
  }

  if (backendType === EXTERNAL) {
    return EXTERNAL
  }

  if (backendType === HORIZONTAL) {
    return SIBLING
  }

  if (backendType === VERTICAL) {
    // If main node is the primary entry, the other is a child
    // If main node is the foreign entry, the other is a parent
    return connection.entry_id === mainNodeId ? CHILD : PARENT
  }

  // Default fallback
  return null
}

const CONNECTION_DISPLAY_ORDER = {
  [PARENT]: 0,
  [SIBLING]: 1,
  [CHILD]: 2,
  [EXTERNAL]: 3,
}

/**
 * Sort connections for display: parent → sibling → child → external.
 * @param {Array} connections
 * @returns {Array}
 */
export const sortConnectionsByDisplayOrder = (connections = []) => {
  return [...connections].sort((a, b) => {
    const orderA = CONNECTION_DISPLAY_ORDER[a?.connection_type] ?? 99
    const orderB = CONNECTION_DISPLAY_ORDER[b?.connection_type] ?? 99
    return orderA - orderB
  })
}
