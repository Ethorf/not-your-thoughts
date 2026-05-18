import extractTextFromHTML from '@utils/extractTextFromHTML'

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const HIGHLIGHT_CLASS = 'connectionSourceHighlight'

/**
 * Wrap plain-text matches in HTML with a highlight span (works across inline tags).
 * @param {string} html
 * @param {string} searchText - plain text or HTML fragment from selection
 * @returns {string}
 */
export const highlightPlainTextInHtml = (html, searchText) => {
  if (!html || !searchText) return html ?? ''

  const plainSearch = (extractTextFromHTML(searchText) || searchText).trim()
  if (!plainSearch) return html

  const escaped = escapeRegExp(plainSearch)
  const regex = new RegExp(`(${escaped})`, 'gi')

  const doc = new DOMParser().parseFromString(html, 'text/html')

  const highlightTextNode = (textNode) => {
    const text = textNode.textContent
    if (!text) return

    regex.lastIndex = 0
    if (!regex.test(text)) return

    regex.lastIndex = 0
    const fragment = doc.createDocumentFragment()
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)))
      }
      const span = doc.createElement('span')
      span.className = HIGHLIGHT_CLASS
      span.textContent = match[0]
      fragment.appendChild(span)
      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
      fragment.appendChild(doc.createTextNode(text.slice(lastIndex)))
    }

    textNode.parentNode?.replaceChild(fragment, textNode)
  }

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      highlightTextNode(node)
      return
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk)
    }
  }

  walk(doc.body)
  return doc.body.innerHTML
}
