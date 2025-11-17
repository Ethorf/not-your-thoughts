/**
 * Utility functions for managing read/unread/updated status of nodes using cookies
 */

const COOKIE_NAME = 'read_nodes'
const COOKIE_EXPIRY_DAYS = 365 // Keep read status for 1 year

/**
 * Get all node read statuses from cookie
 * @returns {Object<string, {entryId: string, readDate: string, status: 'read'|'unread'|'updated'}>} Map of entryId to status object
 */
export const getReadNodes = () => {
  if (typeof document === 'undefined') {
    return {}
  }

  const cookies = document.cookie.split(';')
  const readNodesCookie = cookies.find((cookie) => cookie.trim().startsWith(`${COOKIE_NAME}=`))

  if (!readNodesCookie) {
    return {}
  }

  try {
    const cookieValue = decodeURIComponent(readNodesCookie.split('=')[1])
    const readNodes = JSON.parse(cookieValue)
    // Convert array to object for easier lookup
    if (Array.isArray(readNodes)) {
      // Migrate old format to new format
      const migrated = {}
      readNodes.forEach((entryId) => {
        if (typeof entryId === 'string' || typeof entryId === 'number') {
          migrated[String(entryId)] = {
            entryId: String(entryId),
            readDate: new Date().toISOString(),
            status: 'read',
          }
        }
      })
      return migrated
    }
    return readNodes || {}
  } catch (error) {
    console.error('Error parsing read nodes cookie:', error)
    return {}
  }
}

/**
 * Save read nodes to cookie
 * @param {Object} readNodes - Map of entryId to status object
 */
const saveReadNodes = (readNodes) => {
  if (typeof document === 'undefined') {
    return
  }

  const expiryDate = new Date()
  expiryDate.setTime(expiryDate.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const cookieValue = JSON.stringify(readNodes)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cookieValue)};expires=${expiryDate.toUTCString()};path=/`
}

/**
 * Mark a node as read
 * @param {string|number} entryId - The entry ID to mark as read
 */
export const markNodeAsRead = (entryId) => {
  if (typeof document === 'undefined' || !entryId) {
    return
  }

  const entryIdString = String(entryId)
  const readNodes = getReadNodes()

  readNodes[entryIdString] = {
    entryId: entryIdString,
    readDate: new Date().toISOString(),
    status: 'read',
  }

  saveReadNodes(readNodes)
}

/**
 * Get the read status of a node
 * @param {string|number} entryId - The entry ID to check
 * @returns {'read'|'unread'|'updated'|null} The status of the node, or null if entryId is invalid
 */
export const getNodeStatus = (entryId) => {
  if (!entryId) {
    return null
  }

  const entryIdString = String(entryId)
  const readNodes = getReadNodes()
  const nodeStatus = readNodes[entryIdString]

  if (!nodeStatus) {
    return 'unread'
  }

  return nodeStatus.status || 'read'
}

/**
 * Check if a node is read (legacy function for backwards compatibility)
 * @param {string|number} entryId - The entry ID to check
 * @returns {boolean} True if the node is read, false otherwise
 */
export const isNodeRead = (entryId) => {
  const status = getNodeStatus(entryId)
  return status === 'read' || status === 'updated'
}

/**
 * Check and update node statuses based on date_last_modified
 * @param {Array<{id: string|number, date_last_modified: string}>} nodeEntries - Array of node entries with id and date_last_modified
 * @returns {Object<string, 'read'|'unread'|'updated'>} Map of entryId to status
 */
export const checkAndUpdateNodeStatuses = (nodeEntries) => {
  if (!nodeEntries || !Array.isArray(nodeEntries)) {
    return {}
  }

  const readNodes = getReadNodes()
  const updatedStatuses = {}

  nodeEntries.forEach((node) => {
    const entryIdString = String(node.id)
    const nodeStatus = readNodes[entryIdString]

    if (!nodeStatus) {
      // Node not in cookie, it's unread
      updatedStatuses[entryIdString] = 'unread'
      return
    }

    if (!node.date_last_modified) {
      // No date_last_modified, keep current status
      updatedStatuses[entryIdString] = nodeStatus.status || 'read'
      return
    }

    // Compare dates
    const readDate = new Date(nodeStatus.readDate)
    const lastModifiedDate = new Date(node.date_last_modified)

    if (lastModifiedDate > readDate) {
      // Node has been updated since last read
      readNodes[entryIdString] = {
        ...nodeStatus,
        status: 'updated',
      }
      updatedStatuses[entryIdString] = 'updated'
    } else {
      // Node hasn't been updated, keep current status
      updatedStatuses[entryIdString] = nodeStatus.status || 'read'
    }
  })

  // Save updated statuses to cookie
  saveReadNodes(readNodes)

  return updatedStatuses
}

/**
 * Clear all read status (useful for testing or reset)
 */
export const clearReadStatus = () => {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

