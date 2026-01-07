/**
 * Request deduplication utility for Redux Toolkit async thunks
 * Prevents duplicate API requests with the same parameters
 */

// Map to track pending requests: key -> true
const pendingRequests = new Map()

/**
 * Creates a unique key for a request based on action type and arguments
 * @param {string} actionType - The action type (e.g., 'currentEntryReducer/fetchPublicEntry')
 * @param {any} arg - The argument passed to the thunk
 * @returns {string} A unique key for this request
 */
const createRequestKey = (actionType, arg) => {
  // Handle different argument types
  if (arg === null || arg === undefined) {
    return `${actionType}:null`
  }
  
  if (typeof arg === 'object') {
    // For objects, create a stable key from sorted entries
    const entries = Object.entries(arg).sort(([a], [b]) => a.localeCompare(b))
    const keyString = entries.map(([k, v]) => `${k}:${v}`).join('|')
    return `${actionType}:${keyString}`
  }
  
  return `${actionType}:${arg}`
}

/**
 * Creates a condition function for Redux Toolkit async thunks to prevent duplicate requests
 * Redux Toolkit will skip dispatching the thunk if this returns false
 * @param {string} actionType - The action type
 * @returns {Function} A condition function that returns false if request is already pending
 */
export const createDeduplicationCondition = (actionType) => {
  return (arg, { getState, requestId }) => {
    const key = createRequestKey(actionType, arg)
    
    // Check if request is already pending
    if (pendingRequests.has(key)) {
      return false // Skip this dispatch
    }
    
    // Mark request as pending
    pendingRequests.set(key, requestId)
    return true
  }
}

/**
 * Clears a pending request after it completes
 * @param {string} actionType - The action type
 * @param {any} arg - The argument passed to the thunk
 */
export const clearPendingRequest = (actionType, arg) => {
  const key = createRequestKey(actionType, arg)
  pendingRequests.delete(key)
}

/**
 * Helper to create a condition that checks both deduplication and Redux state
 * @param {string} actionType - The action type
 * @param {Function} stateCheck - Optional function to check Redux state (returns true if should proceed)
 * @returns {Function} Condition function
 */
export const createCondition = (actionType, stateCheck = null) => {
  return (arg, thunkAPI) => {
    // First check deduplication
    const key = createRequestKey(actionType, arg)
    if (pendingRequests.has(key)) {
      return false
    }
    
    // Then check state if provided
    if (stateCheck) {
      const shouldProceed = stateCheck(arg, thunkAPI)
      if (!shouldProceed) {
        return false
      }
    }
    
    // Mark as pending
    pendingRequests.set(key, thunkAPI.requestId)
    return true
  }
}

