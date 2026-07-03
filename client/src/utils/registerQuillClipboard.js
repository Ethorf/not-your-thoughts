import Quill from 'quill'

/**
 * Preserve Quill formatting on paste, but unwrap ephemeral decoration spans.
 */
export const registerQuillClipboardMatchers = (quill) => {
  if (!quill || quill.__nytClipboardMatchersRegistered) {
    return
  }

  quill.__nytClipboardMatchersRegistered = true

  quill.clipboard.addMatcher('SPAN', (node) => {
    if (!node.getAttribute?.('data-nyt-deco')) {
      return undefined
    }

    const Delta = Quill.import('delta')
    return new Delta().insert(node.textContent || '')
  })
}
