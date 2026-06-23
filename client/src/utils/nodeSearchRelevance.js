const getSearchableContentLower = (content) => {
  if (Array.isArray(content)) {
    return content
      .map((chunk) => (typeof chunk === 'string' ? chunk : ''))
      .join(' ')
      .toLowerCase()
  }

  if (typeof content === 'string') {
    return content.toLowerCase()
  }

  return ''
}

/**
 * Lower score = higher search relevance.
 * 0 exact title, 1 title prefix, 2 title contains, 3 content only, 99 no match.
 */
export const getNodeSearchRelevanceScore = (node, term) => {
  const normalizedTerm = term?.trim().toLowerCase()
  if (!normalizedTerm) {
    return 99
  }

  const titleLower = node?.title?.toLowerCase() ?? ''

  if (titleLower === normalizedTerm) {
    return 0
  }
  if (titleLower.startsWith(normalizedTerm)) {
    return 1
  }
  if (titleLower.includes(normalizedTerm)) {
    return 2
  }

  const contentLower = getSearchableContentLower(node?.content)
  if (contentLower.includes(normalizedTerm)) {
    return 3
  }

  return 99
}

export const nodeMatchesSearch = (node, term) => getNodeSearchRelevanceScore(node, term) < 99

export const compareNodesBySearchRelevance = (a, b, term) => {
  const scoreA = getNodeSearchRelevanceScore(a, term)
  const scoreB = getNodeSearchRelevanceScore(b, term)

  if (scoreA !== scoreB) {
    return scoreA - scoreB
  }

  const dateA = new Date(a.date_last_modified || a.date_created || 0)
  const dateB = new Date(b.date_last_modified || b.date_created || 0)
  return dateB - dateA
}

export const filterAndSortNodesBySearch = (nodes = [], term) => {
  const normalizedTerm = term?.trim().toLowerCase()
  if (!normalizedTerm) {
    return [...nodes]
  }

  return nodes
    .filter((node) => nodeMatchesSearch(node, normalizedTerm))
    .sort((a, b) => compareNodesBySearchRelevance(a, b, normalizedTerm))
}
