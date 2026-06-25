const DATAMUSE_SYNONYM_URL = 'https://api.datamuse.com/words'
const MAX_SUGGESTIONS = 16
const MIN_TERM_LENGTH = 3
const MIN_SUGGESTION_LENGTH = 2
const MAX_SUGGESTION_WORDS = 5

const normalizePhrase = (value) => value.trim().toLowerCase().replace(/\s+/g, ' ')

const GENERIC_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'for',
  'with',
  'from',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'can',
  'thing',
  'things',
  'something',
  'someone',
  'anything',
  'everything',
])

const getTitleTerms = (title) => {
  const normalized = title?.trim().toLowerCase() ?? ''
  if (!normalized) return []

  const words = normalized.split(/\s+/).filter((word) => word.length >= MIN_TERM_LENGTH)
  return words.length ? words : [normalized]
}

const fetchSynonymsForTerm = async (term, max = 8) => {
  const url = `${DATAMUSE_SYNONYM_URL}?rel_syn=${encodeURIComponent(term)}&max=${max}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((entry) => ({
      word: String(entry.word || '').toLowerCase(),
      score: Number(entry.score) || 0,
      source: 'synonym',
    }))
  } catch (error) {
    console.error('Datamuse synonym fetch failed:', error.message)
    return []
  }
}

const fetchMeansLikeForTitle = async (title, max = 20) => {
  const url = `${DATAMUSE_SYNONYM_URL}?ml=${encodeURIComponent(title)}&max=${max}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((entry) => ({
      word: String(entry.word || '').toLowerCase(),
      score: Number(entry.score) || 0,
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      source: 'means_like',
    }))
  } catch (error) {
    console.error('Datamuse means-like fetch failed:', error.message)
    return []
  }
}

const isValidSuggestionWord = (word) => {
  const normalized = normalizePhrase(word)
  if (!normalized || normalized.length < MIN_SUGGESTION_LENGTH) {
    return false
  }

  const tokens = normalized.split(' ')
  if (tokens.length > MAX_SUGGESTION_WORDS) {
    return false
  }

  if (tokens.length === 1) {
    return !GENERIC_WORDS.has(normalized)
  }

  const meaningfulTokens = tokens.filter((token) => token.length >= 2 && !GENERIC_WORDS.has(token))
  return meaningfulTokens.length >= 1
}

/**
 * Build ranked AKA suggestions from a node title using Datamuse synonyms.
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {string[]} [params.existingAkas]
 * @returns {Promise<string[]>}
 */
const buildAkaSuggestionsFromTitle = async ({ title, existingAkas = [] }) => {
  const normalizedTitle = title?.trim().toLowerCase() ?? ''
  if (!normalizedTitle) {
    return []
  }

  const excluded = new Set([
    normalizedTitle,
    ...existingAkas.map((aka) => normalizePhrase(String(aka))).filter(Boolean),
  ])

  const titleTerms = getTitleTerms(normalizedTitle)
  const scoredSuggestions = new Map()

  const addSuggestion = (word, score) => {
    const normalized = normalizePhrase(word)
    if (!isValidSuggestionWord(normalized) || excluded.has(normalized)) {
      return
    }

    const multiWordBonus = normalized.includes(' ') ? 1.15 : 1
    const existingScore = scoredSuggestions.get(normalized) ?? 0
    scoredSuggestions.set(normalized, Math.max(existingScore, score * multiWordBonus))
  }

  const [meansLikeResults, ...synonymGroups] = await Promise.all([
    fetchMeansLikeForTitle(normalizedTitle),
    ...titleTerms.map((term) => fetchSynonymsForTerm(term, MAX_SUGGESTIONS)),
  ])

  synonymGroups.flat().forEach(({ word, score }) => {
    addSuggestion(word, 1_000_000 + score)
  })

  meansLikeResults.forEach(({ word, score, tags }) => {
    const isTaggedSynonym = tags.includes('syn')
    const isNoun = tags.includes('n')
    const isPhrase = word.includes(' ')

    if (!isTaggedSynonym && !isNoun && !isPhrase) {
      return
    }

    const weightedScore = isTaggedSynonym ? score : score * 0.75
    addSuggestion(word, weightedScore)
  })

  return [...scoredSuggestions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_SUGGESTIONS)
    .map(([word]) => word)
}

module.exports = {
  buildAkaSuggestionsFromTitle,
}
