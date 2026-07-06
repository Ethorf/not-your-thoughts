export const getLatestContentHtml = (content) => {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content) && content.length > 0 && content[0] != null) {
    return typeof content[0] === 'string' ? content[0] : ''
  }
  return ''
}

export const getJournalTextPreview = (content, maxLength = 40) => {
  const latestContent = getLatestContentHtml(content)
  const textOnlyContent = latestContent
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

  if (!textOnlyContent) return ''
  if (textOnlyContent.length <= maxLength) return textOnlyContent
  return `${textOnlyContent.slice(0, maxLength)}...`
}

export const hasMeaningfulJournalContent = (journalEntry) => {
  return getJournalTextPreview(journalEntry?.content, Number.POSITIVE_INFINITY).length > 0
}
