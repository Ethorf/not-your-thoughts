import { stripDecorationFromHtml } from '@utils/registerQuillTextDecorations'
import { refreshOrderedListDisplay } from '@utils/quillListRepair'

const isEmptyParagraph = (element) => {
  if (!element || element.tagName !== 'P') {
    return false
  }

  const text = element.textContent.replace(/\u200B/g, '').trim()
  return text === '' || element.innerHTML === '<br>' || element.innerHTML === '<br/>'
}

/**
 * Cleans saved HTML before hydrating the editor (reload / entry switch).
 */
export const normalizeQuillHtmlForLoad = (html) => {
  if (!html || typeof document === 'undefined') {
    return html || ''
  }

  const template = document.createElement('div')
  template.innerHTML = stripDecorationFromHtml(html)

  while (template.firstElementChild && isEmptyParagraph(template.firstElementChild)) {
    template.firstElementChild.remove()
  }

  [...template.children].forEach((child) => {
    if (!isEmptyParagraph(child)) {
      return
    }

    const next = child.nextElementSibling
    if (next && (next.tagName === 'OL' || next.tagName === 'UL')) {
      child.remove()
    }
  })

  refreshOrderedListDisplay(template)

  return template.innerHTML
}
