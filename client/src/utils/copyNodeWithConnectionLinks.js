const PUBLIC_SITE_ORIGIN = 'https://www.notyourthoughts.com'
const SUBSTACK_PROMO_ORIGIN = 'https://not-your-thoughts.onrender.com'
const SUBSTACK_PROMO_USER_ID = 'ethorf'

const DECORATION_SELECTOR =
  '[data-nyt-deco], [data-nyt-node-id], [data-nyt-anim], [data-nyt-href], [data-nyt-conn], [data-nyt-cand-id], [data-nyt-tip]'

export const buildPublicNodeEntryUrl = (userId, entryId) =>
  `${PUBLIC_SITE_ORIGIN}/show-node-entry?userId=${encodeURIComponent(userId)}&entryId=${encodeURIComponent(entryId)}`

export const buildSubstackPromoNodeUrl = (entryId) =>
  `${SUBSTACK_PROMO_ORIGIN}/show-node-entry?userId=${SUBSTACK_PROMO_USER_ID}&entryId=${encodeURIComponent(entryId)}`

export const buildSubstackPromoText = (entryId) =>
  `*~*~*HEYHEYHEY*~*~* For the optimum experience of this post feel free to check it out on my site here (${buildSubstackPromoNodeUrl(entryId)}) where you can explore connections, links all that jazz, *~*~*THKNUU*~*~*`

export const buildSubstackPromoHtml = (entryId) => {
  const url = buildSubstackPromoNodeUrl(entryId)
  return `<p>*~*~*HEYHEYHEY*~*~* For the optimum experience of this post feel free to check it out on my site <a href="${url}">here</a> where you can explore connections, links all that jazz, *~*~*THKNUU*~*~*</p>`
}

const unwrapElement = (element) => {
  const parent = element.parentNode
  if (!parent) {
    return
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element)
  }

  parent.removeChild(element)
}

/**
 * Convert live editor HTML so connection highlights become public <a> tags,
 * then strip remaining ephemeral decoration spans.
 */
export const htmlWithPublicConnectionAnchors = (editorHtml, userId) => {
  if (!editorHtml || !userId || typeof document === 'undefined') {
    return { html: editorHtml || '', text: '' }
  }

  const template = document.createElement('div')
  template.innerHTML = editorHtml

  template.querySelectorAll('[data-nyt-deco="connection-internal"]').forEach((element) => {
    const connectedEntryId = element.getAttribute('data-nyt-node-id')
    if (!connectedEntryId) {
      return
    }

    const anchor = document.createElement('a')
    anchor.href = buildPublicNodeEntryUrl(userId, connectedEntryId)
    anchor.textContent = element.textContent
    element.replaceWith(anchor)
  })

  template.querySelectorAll(DECORATION_SELECTOR).forEach((element) => {
    unwrapElement(element)
  })

  return {
    html: template.innerHTML,
    text: template.textContent || '',
  }
}

export const copyNodeHtmlWithConnectionLinks = async (editorRoot, userId, entryId) => {
  if (!editorRoot) {
    throw new Error('Editor is not ready.')
  }

  if (!userId) {
    throw new Error('Sign in to copy public connection links.')
  }

  if (entryId == null) {
    throw new Error('No entry to copy.')
  }

  const { html: bodyHtml, text: bodyText } = htmlWithPublicConnectionAnchors(editorRoot.innerHTML, userId)
  const html = `${buildSubstackPromoHtml(entryId)}${bodyHtml}`
  const text = `${buildSubstackPromoText(entryId)}\n\n${bodyText}`

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ])
    return
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(html)
    return
  }

  throw new Error('Clipboard is not available.')
}
