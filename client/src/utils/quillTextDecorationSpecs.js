import { CONNECTION_TYPES } from '@constants/connectionTypes'
import {
  findIdByNodeTitle,
  resolveConnectedNodeId,
  resolveConnectedNodeTitle,
} from '@utils/formatContentWithConnections'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

const escapeRegExp = (string) => string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const addTerm = (termMap, text, spec) => {
  if (!text) {
    return
  }

  const key = text.toLowerCase()
  if (termMap.has(key)) {
    return
  }

  termMap.set(key, spec)
}

/**
 * Builds prioritized decoration metadata for scanning Quill plain text.
 */
export const buildDecorationMatchSpecs = ({
  connections = [],
  entryId = null,
  nodeEntriesInfo = [],
  allTitles = [],
  shinyCandidateMap = null,
}) => {
  const termMap = new Map()

  connections.forEach((connection) => {
    const {
      primary_source: primarySource,
      connection_type: connectionType,
      foreign_source: foreignSource,
    } = connection

    if (connectionType === EXTERNAL && primarySource && foreignSource) {
      addTerm(termMap, primarySource, {
        deco: 'connection-external',
        href: foreignSource,
      })
      return
    }

    const connectedNodeId = resolveConnectedNodeId(connection, entryId)
    if (!connectedNodeId) {
      return
    }

    const connectedTitle = resolveConnectedNodeTitle(connection, entryId, nodeEntriesInfo)
    if (connectedTitle) {
      addTerm(termMap, connectedTitle, {
        deco: 'connection-internal',
        nodeId: String(connectedNodeId),
        connectionType,
      })
    }

    if (primarySource && (!connectedTitle || primarySource.toLowerCase() !== connectedTitle.toLowerCase())) {
      addTerm(termMap, primarySource, {
        deco: 'connection-internal',
        nodeId: String(connectedNodeId),
        connectionType,
      })
    }
  })

  allTitles.forEach((titleLower) => {
    if (termMap.has(titleLower)) {
      return
    }

    const shinyCandidate = shinyCandidateMap?.get(titleLower)
    if (shinyCandidate?.isDismissed) {
      return
    }

    if (shinyCandidate) {
      addTerm(termMap, titleLower, {
        deco: 'shiny-suggestion',
        nodeId: String(shinyCandidate.nodeId),
        candidateId: shinyCandidate.id,
      })
      return
    }

    const nodeId = findIdByNodeTitle(nodeEntriesInfo, titleLower)
    if (!nodeId) {
      return
    }

    addTerm(termMap, titleLower, {
      deco: 'shiny',
      nodeId: String(nodeId),
    })
  })

  const terms = [...termMap.keys()]
  if (terms.length === 0) {
    return { termMap, pattern: null, terms }
  }

  const pattern = new RegExp(`\\b(${terms.map(escapeRegExp).join('|')})\\b`, 'gi')

  return { termMap, pattern, terms }
}

export const buildFormatsForDecorationSpec = (spec, wordLower, entryId, occurrenceCounts) => {
  const occurrence = occurrenceCounts.get(wordLower) ?? 0
  occurrenceCounts.set(wordLower, occurrence + 1)

  const identity = spec.candidateId ?? spec.nodeId ?? wordLower
  const animationId = entryId ? `${entryId}:${identity}:o${occurrence}` : `${identity}:o${occurrence}`

  const formats = {
    'nyt-deco': spec.deco,
  }

  if (spec.nodeId) {
    formats['nyt-node'] = spec.nodeId
  }

  if (spec.href) {
    formats['nyt-href'] = spec.href
  }

  if (spec.connectionType) {
    formats['nyt-conn'] = spec.connectionType
  }

  if (spec.candidateId) {
    formats['nyt-cand'] = spec.candidateId
  }

  if (spec.deco === 'shiny' || spec.deco === 'shiny-suggestion') {
    formats['nyt-anim'] = animationId
  }

  return formats
}
