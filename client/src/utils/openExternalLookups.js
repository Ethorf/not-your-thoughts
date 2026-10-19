/**
 * Open Merriam-Webster dictionary for a term in a new tab.
 * @param {string} query
 */
export const openWebsterDictionary = (query) => {
  const term = query?.trim()
  if (!term) {
    return
  }

  window.open(
    `https://www.merriam-webster.com/dictionary/${encodeURIComponent(term)}`,
    '_blank',
    'noopener,noreferrer'
  )
}

/**
 * Open Wikipedia search for a term in a new tab.
 * @param {string} query
 */
export const openWikipediaSearch = (query) => {
  const term = query?.trim()
  if (!term) {
    return
  }

  window.open(
    `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`,
    '_blank',
    'noopener,noreferrer'
  )
}
