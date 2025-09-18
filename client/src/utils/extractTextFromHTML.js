/**
 * Extracts plain text content from an HTML string
 * @param {string} htmlString - The HTML string to extract text from
 * @returns {string} - The plain text content
 */
const extractTextFromHTML = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return ''
  }

  const doc = new DOMParser().parseFromString(htmlString, 'text/html')
  return doc.body.textContent || ''
}

export default extractTextFromHTML
