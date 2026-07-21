import Quill from 'quill'

import {
  buildDecorationMatchSpecs,
  buildFormatsForDecorationSpec,
} from '@utils/quillTextDecorationSpecs'
import { getShinyTextAnimationDelay } from '@utils/shinyTextAnimation'

const Parchment = Quill.import('parchment')

const DECORATION_ATTRS = [
  ['nyt-deco', 'data-nyt-deco'],
  ['nyt-node', 'data-nyt-node-id'],
  ['nyt-anim', 'data-nyt-anim'],
  ['nyt-href', 'data-nyt-href'],
  ['nyt-conn', 'data-nyt-conn'],
  ['nyt-cand', 'data-nyt-cand-id'],
]

const CLEAR_FORMAT = DECORATION_ATTRS.reduce((formats, [name]) => {
  formats[name] = false
  return formats
}, {})

/** Format keys that affect visible decoration identity (ignore animation id churn). */
const STABLE_FORMAT_KEYS = ['nyt-deco', 'nyt-node', 'nyt-href', 'nyt-conn', 'nyt-cand']

const SHINY_ANIMATION_DURATION_SEC = 3
const APPLY_DEBOUNCE_MS = 120
const SELECTION_LOCK_MS = 320
const SELECTION_LOCK_AFTER_FORMAT_MS = 500

const isAppleTouchDevice = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  return (
    /iP(ad|hone|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

const getCursorIndexAfterDelta = (delta) => {
  if (!delta?.ops?.length) {
    return null
  }

  let index = 0

  for (const op of delta.ops) {
    if (typeof op.retain === 'number') {
      index += op.retain
    }

    if (typeof op.insert === 'string') {
      index += op.insert.length
    } else if (op.insert != null) {
      index += 1
    }
  }

  return index
}

const clampSelectionRange = (quill, selection) => {
  if (!selection) {
    return null
  }

  const maxIndex = Math.max(0, quill.getLength() - 1)
  const index = Math.min(Math.max(0, selection.index), maxIndex)
  const length = Math.min(Math.max(0, selection.length ?? 0), maxIndex - index)

  return { index, length }
}

const normalizeFormatValue = (value) => {
  if (value == null || value === false) {
    return null
  }
  return String(value)
}

const stableFormatsMatch = (existing, desired) =>
  STABLE_FORMAT_KEYS.every((key) => normalizeFormatValue(existing?.[key]) === normalizeFormatValue(desired?.[key]))

class TextDecorationModule {
  constructor(quill, options = {}) {
    this.quill = quill
    this.options = options
    this.context = null
    this.debounceId = null
    this.restoreRafIds = []
    this.restoreTimeoutIds = []
    this.selectionLockTimeoutId = null
    this.isApplying = false
    this.pendingSelection = null
    this.lastCaret = null
    // Only updated from edits — never from selection-change yanks after formatText.
    this.intendedCaretAfterEdit = null
    this.lockedSelection = null
    this.hasDeferredDecorations = false
    this.isComposing = false
    this.isAppleTouch = isAppleTouchDevice()

    this.quill.on('text-change', this.handleTextChange)
    this.quill.on('selection-change', this.handleSelectionChange)

    this.quill.root.addEventListener('compositionstart', this.handleCompositionStart)
    this.quill.root.addEventListener('compositionend', this.handleCompositionEnd)
  }

  rememberCaret(range, { fromEdit = false } = {}) {
    if (!range) {
      return
    }

    const next = { index: range.index, length: range.length ?? 0 }
    this.lastCaret = next
    this.pendingSelection = next
    if (fromEdit) {
      this.intendedCaretAfterEdit = next
    }
  }

  lockSelection(range, durationMs = SELECTION_LOCK_MS) {
    const clamped = clampSelectionRange(this.quill, range)
    if (!clamped) {
      return
    }

    this.lockedSelection = clamped
    clearTimeout(this.selectionLockTimeoutId)
    this.selectionLockTimeoutId = window.setTimeout(() => {
      this.lockedSelection = null
      this.selectionLockTimeoutId = null
    }, durationMs)
  }

  handleSelectionChange = (range, _oldRange, source) => {
    if (!range) {
      return
    }

    // While decorations are settling, ignore iOS yanking the caret to the
    // start of a newly wrapped shiny span.
    if (this.lockedSelection) {
      const locked = this.lockedSelection
      if (range.index !== locked.index || (range.length ?? 0) !== locked.length) {
        this.quill.setSelection(locked.index, locked.length, 'silent')
      }
      return
    }

    if (source === 'user' && !this.isApplying) {
      this.rememberCaret(range)
      // Finish a deferred first shiny wrap once the caret leaves the word.
      if (this.hasDeferredDecorations) {
        this.scheduleApply()
      }
    }
  }

  handleCompositionStart = () => {
    this.isComposing = true
    clearTimeout(this.debounceId)
  }

  handleCompositionEnd = () => {
    this.isComposing = false
    const liveSelection = this.quill.getSelection()
    if (liveSelection) {
      this.rememberCaret(liveSelection, { fromEdit: true })
      this.lockSelection(liveSelection)
    }
    this.scheduleApply()
  }

  handleTextChange = (delta, _oldDelta, source) => {
    if (this.isApplying || source === 'api' || this.isComposing) {
      return
    }

    const selectionFromDelta = getCursorIndexAfterDelta(delta)
    const liveSelection = this.quill.getSelection()
    const index = selectionFromDelta ?? liveSelection?.index ?? this.lastCaret?.index

    if (index != null) {
      this.rememberCaret(
        {
          index,
          length: liveSelection?.length ?? this.lastCaret?.length ?? 0,
        },
        { fromEdit: true }
      )
      this.lockSelection(this.pendingSelection)
    }

    this.scheduleApply()
  }

  setContext(context) {
    this.context = context
    this.scheduleApply()
  }

  scheduleApply() {
    if (!this.context?.enabled || this.isComposing) {
      return
    }

    clearTimeout(this.debounceId)
    this.debounceId = window.setTimeout(() => {
      this.applyDecorations()
    }, APPLY_DEBOUNCE_MS)
  }

  clearScheduledRestores() {
    this.restoreRafIds.forEach((id) => cancelAnimationFrame(id))
    this.restoreTimeoutIds.forEach((id) => clearTimeout(id))
    this.restoreRafIds = []
    this.restoreTimeoutIds = []
  }

  resolveRestoreSelection(appliedRanges) {
    const base =
      this.intendedCaretAfterEdit ??
      this.lockedSelection ??
      this.pendingSelection ??
      this.lastCaret ??
      this.quill.getSelection()
    const selection = clampSelectionRange(this.quill, base)

    if (!selection) {
      return null
    }

    let restoreIndex = selection.index
    const restoreLength = selection.length
    const intendedIndex = this.intendedCaretAfterEdit?.index

    appliedRanges.forEach(({ index, length }) => {
      const rangeEnd = index + length
      // iOS often parks the caret at the start of a newly wrapped shiny span
      // (or one char before). If the edit caret was at/after the word, snap to end.
      const editWasAtOrAfterWord = intendedIndex == null || intendedIndex >= rangeEnd
      if (editWasAtOrAfterWord && restoreIndex >= index - 1 && restoreIndex < rangeEnd) {
        restoreIndex = rangeEnd
      } else if (restoreIndex > index && restoreIndex < rangeEnd) {
        restoreIndex = rangeEnd
      }
    })

    // Prefer the post-edit caret when it is further forward than a collapsed restore.
    if (this.intendedCaretAfterEdit?.length === 0) {
      restoreIndex = Math.max(restoreIndex, this.intendedCaretAfterEdit.index)
    } else if (this.lastCaret?.length === 0) {
      restoreIndex = Math.max(restoreIndex, this.lastCaret.index)
    }

    return clampSelectionRange(this.quill, { index: restoreIndex, length: restoreLength })
  }

  forceSelection(selection) {
    // Never steal focus from another input (e.g. the title field) — only
    // restore the caret when the editor already owns focus.
    if (!selection || !this.quill.hasFocus()) {
      return
    }

    // Quill's model selection can look correct on iOS while the real DOM caret
    // has already jumped to before a new inline blot — always sync both.
    this.quill.setSelection(selection.index, selection.length, 'silent')
    this.forceNativeDomCaret(selection.index)
  }

  /**
   * Place the real DOM caret. iOS often ignores Quill setSelection after formatText.
   */
  forceNativeDomCaret(index) {
    try {
      const leafResult = this.quill.getLeaf(index)
      if (!leafResult?.[0]) {
        return
      }

      let [leaf, offset] = leafResult
      let node = leaf.domNode

      if (!node) {
        return
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const textChild = Array.from(node.childNodes).find((child) => child.nodeType === Node.TEXT_NODE)
        if (textChild) {
          const textLength = textChild.textContent?.length ?? 0
          if (offset >= textLength) {
            // Caret belongs after this blot — use the next text node when present.
            let sibling = node.nextSibling
            while (sibling && sibling.nodeType === Node.ELEMENT_NODE) {
              const nestedText = Array.from(sibling.childNodes).find((child) => child.nodeType === Node.TEXT_NODE)
              if (nestedText) {
                node = nestedText
                offset = 0
                break
              }
              sibling = sibling.nextSibling
            }
            if (node === leaf.domNode) {
              node = textChild
              offset = textLength
            }
          } else {
            node = textChild
          }
        }
      }

      if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) {
        return
      }

      const range = document.createRange()
      const sel = window.getSelection()
      if (!sel) {
        return
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const max = node.length
        range.setStart(node, Math.max(0, Math.min(offset, max)))
      } else {
        range.setStart(node, Math.max(0, Math.min(offset, node.childNodes.length)))
      }
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    } catch {
      // Native restore is best-effort; Quill selection was already set.
    }
  }

  restoreSelectionIfNeeded(appliedRanges = []) {
    const selection = this.resolveRestoreSelection(appliedRanges)
    if (!selection) {
      return
    }

    const lockMs = appliedRanges.length > 0 ? SELECTION_LOCK_AFTER_FORMAT_MS : SELECTION_LOCK_MS
    this.lockSelection(selection, lockMs)

    // After a real format wrap, always force DOM caret — Quill may already
    // report the intended index while iOS visually parked it before the span.
    if (appliedRanges.length > 0) {
      this.forceSelection(selection)
    } else {
      const current = this.quill.getSelection()
      const alreadyCorrect =
        current && current.index === selection.index && (current.length ?? 0) === selection.length
      if (!alreadyCorrect) {
        this.forceSelection(selection)
      }
    }

    this.clearScheduledRestores()

    if (appliedRanges.length === 0) {
      return
    }

    const followUpDelays = this.isAppleTouch ? [0, 16, 48, 100, 200, 350] : [0, 32]
    followUpDelays.forEach((delay) => {
      const timeoutId = window.setTimeout(() => {
        const rafId = requestAnimationFrame(() => {
          const locked = this.lockedSelection ?? selection
          this.forceSelection(locked)
        })
        this.restoreRafIds.push(rafId)
      }, delay)
      this.restoreTimeoutIds.push(timeoutId)
    })
  }

  collectDesiredRanges(specs, searchableText) {
    const desiredRanges = []
    const occurrenceCounts = new Map()
    const { entryId } = this.context

    specs.pattern.lastIndex = 0
    let match = specs.pattern.exec(searchableText)

    while (match) {
      if (match.index === specs.pattern.lastIndex) {
        specs.pattern.lastIndex += 1
      }

      const word = match[0]
      const spec = specs.termMap.get(word.toLowerCase())

      if (spec) {
        const formats = buildFormatsForDecorationSpec(spec, word.toLowerCase(), entryId, occurrenceCounts)
        desiredRanges.push({
          index: match.index,
          length: word.length,
          formats,
        })
      }

      match = specs.pattern.exec(searchableText)
    }

    return desiredRanges
  }

  applyDecorations() {
    if (!this.context?.enabled) {
      return
    }

    const specs = buildDecorationMatchSpecs(this.context)
    const length = Math.max(0, this.quill.getLength() - 1)
    const appliedRanges = []

    this.isApplying = true

    try {
      if (length === 0 || !specs.pattern) {
        this.clearDecorationsInRange(0, length)
        this.restoreSelectionIfNeeded(appliedRanges)
        return
      }

      const text = this.quill.getText()
      const searchableText = text.endsWith('\n') ? text.slice(0, -1) : text
      const desiredRanges = this.collectDesiredRanges(specs, searchableText)

      // Clear decorations only where they no longer belong, then format missing/changed ones.
      // Avoids unwrap/rewrapping every shiny span on each keystroke (main iOS caret killer).
      this.syncDecorations(desiredRanges, length, appliedRanges)
      this.applyShinyAnimationDelays()
      this.restoreSelectionIfNeeded(appliedRanges)
    } finally {
      this.isApplying = false
    }
  }

  syncDecorations(desiredRanges, docLength, appliedRanges) {
    this.hasDeferredDecorations = false
    // Prefer live caret for defer checks so tapping away can finish a pending wrap.
    const caretIndex =
      this.quill.getSelection()?.index ??
      this.intendedCaretAfterEdit?.index ??
      this.lockedSelection?.index ??
      null

    // Clear first so we never wipe a freshly applied range in the same pass.
    let index = 0
    while (index < docLength) {
      const formats = this.quill.getFormat(index, 1)
      if (!formats['nyt-deco']) {
        index += 1
        continue
      }

      let end = index + 1
      while (end < docLength) {
        const nextFormats = this.quill.getFormat(end, 1)
        const sameDecoration =
          nextFormats['nyt-deco'] === formats['nyt-deco'] &&
          nextFormats['nyt-node'] === formats['nyt-node'] &&
          nextFormats['nyt-cand'] === formats['nyt-cand']

        if (!sameDecoration) {
          break
        }
        end += 1
      }

      const matchingDesired = desiredRanges.find(
        (range) =>
          range.index === index &&
          range.index + range.length === end &&
          stableFormatsMatch(formats, range.formats)
      )

      if (!matchingDesired) {
        this.quill.formatText(index, end - index, CLEAR_FORMAT, 'silent')
      }

      index = end
    }

    desiredRanges.forEach((range) => {
      const rangeEnd = range.index + range.length

      // iOS: defer the first wrap while the caret is still in/at the end of this match.
      // Wrapping at that boundary is what yanks the caret to before the span.
      if (this.isAppleTouch && caretIndex != null && caretIndex >= range.index && caretIndex <= rangeEnd) {
        this.hasDeferredDecorations = true
        return
      }

      const existing = this.quill.getFormat(range.index, range.length)
      if (stableFormatsMatch(existing, range.formats)) {
        return
      }

      this.quill.formatText(range.index, range.length, range.formats, 'silent')
      appliedRanges.push({ index: range.index, length: range.length })
    })
  }

  clearDecorationsInRange(start, end) {
    if (end <= start) {
      return
    }
    this.quill.formatText(start, end - start, CLEAR_FORMAT, 'silent')
  }

  applyShinyAnimationDelays() {
    // Rewriting animationDelay restarts the CSS animation. Keep the first
    // phase-lock on each DOM node; only re-apply when Quill recreates the span.
    this.quill.root
      .querySelectorAll('[data-nyt-deco="shiny"], [data-nyt-deco="shiny-suggestion"]')
      .forEach((element) => {
        if (element.style.animationDelay) {
          return
        }

        const animationId = element.getAttribute('data-nyt-anim')
        const delay = getShinyTextAnimationDelay(animationId, SHINY_ANIMATION_DURATION_SEC)

        if (delay) {
          element.style.animationDelay = delay
        }
      })
  }

  destroy() {
    clearTimeout(this.debounceId)
    clearTimeout(this.selectionLockTimeoutId)
    this.clearScheduledRestores()
    this.quill.off('text-change', this.handleTextChange)
    this.quill.off('selection-change', this.handleSelectionChange)
    this.quill.root.removeEventListener('compositionstart', this.handleCompositionStart)
    this.quill.root.removeEventListener('compositionend', this.handleCompositionEnd)
  }
}

TextDecorationModule.DEFAULTS = {
  enabled: true,
}

export const TEXT_DECORATION_MODULE_NAME = 'textDecorations'

let hasRegisteredTextDecorations = false

export const registerQuillTextDecorations = () => {
  if (hasRegisteredTextDecorations) {
    return
  }

  DECORATION_ATTRS.forEach(([name, attributeName]) => {
    const attributor = new Parchment.Attributor.Attribute(name, attributeName, {
      scope: Parchment.Scope.INLINE,
    })
    Quill.register(attributor, true)
  })

  Quill.register(`modules/${TEXT_DECORATION_MODULE_NAME}`, TextDecorationModule)
  hasRegisteredTextDecorations = true
}

const DECORATION_SELECTOR =
  '[data-nyt-deco], [data-nyt-node-id], [data-nyt-anim], [data-nyt-href], [data-nyt-conn], [data-nyt-cand-id]'

/**
 * Removes ephemeral editor decorations before persisting note HTML.
 */
export const stripDecorationFromHtml = (html) => {
  if (!html || typeof document === 'undefined') {
    return html || ''
  }

  const template = document.createElement('div')
  template.innerHTML = html

  template.querySelectorAll(DECORATION_SELECTOR).forEach((element) => {
    const parent = element.parentNode
    if (!parent) {
      return
    }

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element)
    }

    parent.removeChild(element)
  })

  return template.innerHTML
}

export const getTextDecorationModule = (quill) => {
  if (!quill) {
    return null
  }

  return quill.getModule(TEXT_DECORATION_MODULE_NAME)
}
