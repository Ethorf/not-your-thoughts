export const highlightMatchingText = (content, match) => {
  if (!match) return content
  const regex = new RegExp(`(${match})`, 'gi')
  return content?.replace(regex, '<span class="highlight">$1</span>')
}
