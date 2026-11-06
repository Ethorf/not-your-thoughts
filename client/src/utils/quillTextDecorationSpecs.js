import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { resolveConnectedNodeId, resolveConnectedNodeTitle } from '@utils/formatContentWithConnections'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

const escapeRegExp = (string) => string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Leading articles we allow the typed phrase to omit when matching a node title. */
const LEADING_ARTICLE_RE = /^(the|a|an)\s+/i

/** Single title words shorter than this stay exact-phrase-only ("my" must not match everything). */
const MIN_SINGLE_WORD_MATCH_LENGTH = 6

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

/**
 * Distinctive words from a title that can match on their own.
 * "relitigating my misanthropy" yields "relitigating" and "misanthropy", not "my".
 *
 * @param {string} title
 * @returns {string[]}
 */
export const getSignificantTitleWords = (title) => {
  const base = title?.trim().toLowerCase()
  if (!base) {
    return []
  }

  const words = base.split(/\s+/).map((token) => token.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ''))
  return [...new Set(words.filter((word) => word.length >= MIN_SINGLE_WORD_MATCH_LENGTH))]
}

// Only unconnected title matches use single-word fuzzy highlighting.
// Connected text must match the node title or the explicit primary_source phrase.
const allowsSingleWordMatch = (spec) =>
  spec?.deco === 'shiny' || spec?.deco === 'shiny-suggestion'

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
 * Exact title phrases are registered before article-stripped variants and before
 * single words longer than 5 characters, so a node titled "inner lawyer" wins
 * over a variant of "the inner lawyer".
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
  const wordMap = new Map()
  const currentTitleLower = currentTitle?.trim().toLowerCase() ?? ''
  const currentEntryId = Number(entryId)
  const titleToId = new Map()
  const idToTitle = new Map()

  ;(nodeEntriesInfo || []).forEach((node) => {
    if (node?.id == null) {
      return
    }

    const titleKey = node?.title?.trim().toLowerCase()
    if (titleKey && !titleToId.has(titleKey)) {
      titleToId.set(titleKey, node.id)
    }

    if (node?.title?.trim() && !idToTitle.has(String(node.id))) {
      idToTitle.set(String(node.id), node.title.trim())
    }
  })
  /** @type {Array<{ title: string, spec: Object }>} */
  const pendingTitleSpecs = []
  /** Titles / sources already claimed by an explicit connection — no shiny single-word bleed. */
  const connectedPhraseKeys = new Set()
  const connectedNodeIds = new Set()

  const resolveNodeTitle = (nodeId, fallbackTitle = '') => {
    if (nodeId == null) {
      return fallbackTitle?.trim() || ''
    }

    return idToTitle.get(String(nodeId)) || fallbackTitle?.trim() || ''
  }

  const queueTitleSpec = (title, spec) => {
    if (!title || isCurrentEntryTitle(title, currentTitleLower)) {
      return
    }
    pendingTitleSpecs.push({
      title,
      spec: {
        ...spec,
        nodeTitle: spec.nodeTitle || resolveNodeTitle(spec.nodeId, title),
      },
    })
  }

  connections.forEach((connection) => {
    const {
      primary_source: primarySource,
      connection_type: connectionType,
      foreign_source: foreignSource,
    } = connection

    if (connectionType === EXTERNAL && primarySource && foreignSource) {
      connectedPhraseKeys.add(primarySource.toLowerCase())
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

    connectedNodeIds.add(String(connectedNodeId))

    const connectedTitle = resolveConnectedNodeTitle(connection, entryId, nodeEntriesInfo)
    if (connectedTitle) {
      connectedPhraseKeys.add(connectedTitle.toLowerCase())
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
      connectedPhraseKeys.add(primarySource.toLowerCase())
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

    // Connected titles are phrase-matched only via the connection specs above.
    if (connectedPhraseKeys.has(titleLower)) {
      return
    }

    const nodeId = titleToId.get(titleLower)
    if (nodeId != null && connectedNodeIds.has(String(nodeId))) {
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
  // Single words stay in a lookup map. Putting every word into the phrase regex
  // makes it enormous and freezes the editor while matching.
  pendingTitleSpecs.forEach(({ title, spec }) => {
    if (!allowsSingleWordMatch(spec)) {
      return
    }

    getSignificantTitleWords(title).forEach((word) => {
      if (word === currentTitleLower || termMap.has(word) || wordMap.has(word)) {
        return
      }
      wordMap.set(word, spec)
    })
  })

  const terms = [...termMap.keys()].sort((a, b) => b.length - a.length)
  const pattern = terms.length === 0 ? null : new RegExp(`\\b(${terms.map(escapeRegExp).join('|')})\\b`, 'gi')

  return { termMap, pattern, terms, wordMap }
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

  if (spec.nodeTitle) {
    formats['nyt-tip'] = spec.nodeTitle
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
