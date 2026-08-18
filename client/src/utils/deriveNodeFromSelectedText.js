const MAX_NODE_TITLE_LENGTH = 80

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const toQuillHtml = (plainText) => {
  const paragraphs = plainText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return ''
  }

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
}

/**
 * Turn highlighted journal text into a node title and optional body.
 * Short phrases become the title only; longer excerpts also fill the node content.
 */
export const deriveNodeFromSelectedText = (rawText) => {
  const text = typeof rawText === 'string' ? rawText.replace(/\u00a0/g, ' ').trim() : ''
  if (!text) {
    return null
  }

  const firstLine = text.split(/\n/)[0].replace(/\s+/g, ' ').trim()
  const titleSource = firstLine || text.replace(/\s+/g, ' ').trim()
  const title =
    titleSource.length <= MAX_NODE_TITLE_LENGTH ? titleSource : `${titleSource.slice(0, MAX_NODE_TITLE_LENGTH).trim()}…`

  const content = text === title ? '' : toQuillHtml(text)

  return { title, content }
}
