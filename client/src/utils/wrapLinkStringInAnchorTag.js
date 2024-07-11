export const wrapLinkStringInAnchorTag = (content, linkString, link) => {
  const linkRegex = new RegExp(`(${linkString})`, 'gi')
  const updatedContent = content.replace(
    linkRegex,
    `<a href="${link}" target="_blank" rel="noopener noreferrer">$1</a>`
  )
  console.log(updatedContent)
  return updatedContent
}
