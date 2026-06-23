import { resolveConnectedNodeTitle } from '@utils/formatContentWithConnections'

/**
 * @typedef {Object} ShinyTextCandidate
 * @property {string} id - Stable id (node id as string)
 * @property {string} title - Canonical node title
 * @property {string} titleLower - Lowercase title for matching content
 * @property {number} nodeId - Target node entry id
 * @property {boolean} isDismissed - When true, do not render shiny highlight for this title
 */

/**
 * Primary sources already linked on this entry (lowercase), including connected node titles.
 */
export const getConnectedSourceKeys = (connections = [], entryId = null, nodeEntriesInfo = []) => {
  const keys = new Set()

  connections?.forEach((connection) => {
    if (connection.primary_source) {
      keys.add(connection.primary_source.toLowerCase())
    }

    const connectedTitle = resolveConnectedNodeTitle(connection, entryId, nodeEntriesInfo)
    if (connectedTitle) {
      keys.add(connectedTitle.toLowerCase())
    }
  })

  return keys
}

/**
 * Build shiny text candidate objects for titles that appear in content but are not yet connected.
 *
 * @param {Object} params
 * @param {Array} params.nodeEntriesInfo
 * @param {string} params.currentTitle
 * @param {Set<string>} params.connectedSourceKeys
 * @param {Set<number|string>} [params.dismissedSuggestedEntryIds] - Persisted dismissals by target node id
 * @returns {ShinyTextCandidate[]}
 */
export const buildShinyTextCandidates = ({
  nodeEntriesInfo = [],
  currentTitle = '',
  connectedSourceKeys = new Set(),
  dismissedSuggestedEntryIds = new Set(),
}) => {
  const currentTitleLower = currentTitle?.toLowerCase() ?? ''

  return (nodeEntriesInfo || [])
    .filter((node) => {
      const titleLower = node?.title?.toLowerCase()
      if (!titleLower || titleLower === currentTitleLower) {
        return false
      }
      return !connectedSourceKeys.has(titleLower)
    })
    .map((node) => {
      const titleLower = node.title.toLowerCase()
      const isDismissed = dismissedSuggestedEntryIds.has(node.id) || dismissedSuggestedEntryIds.has(String(node.id))
      return {
        id: String(node.id),
        title: node.title,
        titleLower,
        nodeId: node.id,
        isDismissed,
      }
    })
}

/**
 * @param {Array<{ suggested_entry_id: number }>} dismissals
 * @returns {Set<number>}
 */
export const getDismissedSuggestedEntryIds = (dismissals = []) => {
  return new Set(
    dismissals
      .map((dismissal) => dismissal?.suggested_entry_id)
      .filter((id) => id != null)
      .map((id) => Number(id))
  )
}

/**
 * @param {ShinyTextCandidate[]} candidates
 * @returns {Map<string, ShinyTextCandidate>}
 */
export const shinyTextCandidatesToMap = (candidates = []) => {
  return new Map(candidates.map((candidate) => [candidate.titleLower, candidate]))
}
