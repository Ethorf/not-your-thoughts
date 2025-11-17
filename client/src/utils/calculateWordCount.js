/**
 * Calculates the number of words in a string or array of strings.
 * Mirrors the logic used within the editor to determine entry word counts.
 * @param {string|string[]} source - Entry content to evaluate.
 * @returns {number} Total word count.
 */
const calculateWordCount = (source) => {
  if (!source) {
    return 0
  }

  const content = Array.isArray(source) ? source[0] || '' : source

  if (typeof content !== 'string') {
    return 0
  }

  const trimmed = content.trim()
  if (!trimmed) {
    return 0
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  return words.length
}

export default calculateWordCount
