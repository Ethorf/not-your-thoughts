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

/** Leading articles we allow the typed phrase to omit when matching a node title. */
const LEADING_ARTICLE_RE = /^(the|a|an)\s+/i

/**
 * Match phrases for a title: exact lowercased title, plus the title with a leading
 * article stripped (e.g. "the inner lawyer" also matches "inner lawyer").
 *
 * @param {string} title
 * @returns {string[]}
 */
export const getTitleMatchPhrases = (title) => {
  const base = title?.trim().toLowerCase()
  if (!base) {
    return []
  }

  const phrases = [base]
  const withoutArticle = base.replace(LEADING_ARTICLE_RE, '').trim()
  if (withoutArticle && withoutArticle !== base) {
    phrases.push(withoutArticle)
  }

  return phrases
}

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

const isCurrentEntryTitle = (text, currentTitleLower) => {
  if (!text || !currentTitleLower) {
    return false
  }

  return text.toLowerCase() === currentTitleLower
}

/**
 * Builds prioritized decoration metadata for scanning Quill plain text.
 * Exact title phrases are registered before article-stripped variants so a node
 * titled "inner lawyer" wins over a variant of "the inner lawyer".
 */
export const buildDecorationMatchSpecs = ({
  connections = [],
  entryId = null,
  nodeEntriesInfo = [],
  allTitles = [],
  shinyCandidateMap = null,
  currentTitle = '',
}) => {
  const termMap = new Map()
  const currentTitleLower = currentTitle?.trim().toLowerCase() ?? ''
  const currentEntryId = Number(entryId)
  /** @type {Array<{ title: string, spec: Object }>} */
  const pendingTitleSpecs = []

  const queueTitleSpec = (title, spec) => {
    if (!title || isCurrentEntryTitle(title, currentTitleLower)) {
      return
    }
    pendingTitleSpecs.push({ title, spec })
  }

  connections.forEach((connection) => {
    const {
      primary_source: primarySource,
      connection_type: connectionType,
      foreign_source: foreignSource,
    } = connection

    if (connectionType === EXTERNAL && primarySource && foreignSource) {
      queueTitleSpec(primarySource, {
        deco: 'connection-external',
        href: foreignSource,
      })
      return
    }

    const connectedNodeId = resolveConnectedNodeId(connection, entryId)
    if (!connectedNodeId || Number(connectedNodeId) === currentEntryId) {
      return
    }

    const connectedTitle = resolveConnectedNodeTitle(connection, entryId, nodeEntriesInfo)
    if (connectedTitle) {
      queueTitleSpec(connectedTitle, {
        deco: 'connection-internal',
        nodeId: String(connectedNodeId),
        connectionType,
      })
    }

    if (
      primarySource &&
      (!connectedTitle || primarySource.toLowerCase() !== connectedTitle.toLowerCase())
    ) {
      queueTitleSpec(primarySource, {
        deco: 'connection-internal',
        nodeId: String(connectedNodeId),
        connectionType,
      })
    }
  })

  allTitles.forEach((titleLower) => {
    if (isCurrentEntryTitle(titleLower, currentTitleLower)) {
      return
    }

    const shinyCandidate = shinyCandidateMap?.get(titleLower)
    if (shinyCandidate?.isDismissed) {
      return
    }

    if (shinyCandidate) {
      queueTitleSpec(titleLower, {
        deco: 'shiny-suggestion',
        nodeId: String(shinyCandidate.nodeId),
        candidateId: shinyCandidate.id,
      })
      return
    }

    const nodeId = findIdByNodeTitle(nodeEntriesInfo, titleLower)
    if (!nodeId || Number(nodeId) === currentEntryId) {
      return
    }

    queueTitleSpec(titleLower, {
      deco: 'shiny',
      nodeId: String(nodeId),
    })
  })

  // Exact phrases first, then article-stripped variants (fill gaps only).
  pendingTitleSpecs.forEach(({ title, spec }) => {
    const [exact] = getTitleMatchPhrases(title)
    addTerm(termMap, exact, spec)
  })
  pendingTitleSpecs.forEach(({ title, spec }) => {
    getTitleMatchPhrases(title)
      .slice(1)
      .forEach((variant) => {
        addTerm(termMap, variant, spec)
      })
  })

  const terms = [...termMap.keys()].sort((a, b) => b.length - a.length)
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
