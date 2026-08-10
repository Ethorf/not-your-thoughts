import Quill from 'quill'

/**
 * Preserve Quill formatting on paste, but unwrap ephemeral decoration spans.
 * Matchers must always return a Delta with `.ops` — undefined crashes Delta.concat.
 */
export const registerQuillClipboardMatchers = (quill) => {
  if (!quill || quill.__nytClipboardMatchersRegistered) {
    return
  }

  quill.__nytClipboardMatchersRegistered = true

  const Delta = Quill.import('delta')

  const toSafeDelta = (node, delta) => {
    if (delta && Array.isArray(delta.ops)) {
      return delta
    }
    return new Delta().insert(node?.textContent || '')
  }

  quill.clipboard.addMatcher('SPAN', (node, delta) => {
    const safeDelta = toSafeDelta(node, delta)

    if (!node?.getAttribute?.('data-nyt-deco')) {
      return safeDelta
    }

    return new Delta().insert(node.textContent || '')
  })
}
