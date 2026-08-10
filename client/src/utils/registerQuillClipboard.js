import Quill from 'quill'

/**
 * Preserve Quill formatting on paste, but unwrap ephemeral decoration spans.
 * Matchers must always return a Delta — returning undefined crashes Delta.concat.
 */
export const registerQuillClipboardMatchers = (quill) => {
  if (!quill || quill.__nytClipboardMatchersRegistered) {
    return
  }

  quill.__nytClipboardMatchersRegistered = true

  quill.clipboard.addMatcher('SPAN', (node, delta) => {
    if (!node.getAttribute?.('data-nyt-deco')) {
      return delta
    }

    const Delta = Quill.import('delta')
    return new Delta().insert(node.textContent || '')
  })
}
