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
const SIGNIFICANT_WORD_PATTERN = /\b[a-z0-9][a-z0-9'-]{5,}\b/gi
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
    this.cachedSpecs = null
    this.cachedSpecKey = null

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

    // iOS-only: while decorations are settling, ignore the caret getting yanked
    // to the start of a newly wrapped shiny span. Enforcing this on desktop
    // collapses drag-selections and breaks copy/paste.
    if (this.isAppleTouch && this.lockedSelection) {
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
      if (this.isAppleTouch) {
        this.lockSelection(liveSelection)
      }
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
      if (this.isAppleTouch) {
        this.lockSelection(this.pendingSelection)
      }
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

    this.quill.setSelection(selection.index, selection.length, 'silent')

    // Native DOM caret forcing collapses any range selection (breaks copy) and
    // is only needed on iOS where Quill's model selection can lie after formatText.
    if (this.isAppleTouch) {
      this.forceNativeDomCaret(selection.index)
    }
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

    // Desktop: avoid selection locks and native caret forcing — they collapse
    // drag-selections (copy/paste) and fight backspace caret movement.
    if (!this.isAppleTouch) {
      if (appliedRanges.length === 0) {
        return
      }

      if (!this.quill.hasFocus()) {
        return
      }

      const current = this.quill.getSelection()
      // Never collapse an active range selection the user is making for copy.
      if (current && current.length > 0) {
        return
      }

      const alreadyCorrect =
        current && current.index === selection.index && (current.length ?? 0) === selection.length
      if (!alreadyCorrect) {
        this.quill.setSelection(selection.index, selection.length, 'silent')
      }
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

    const followUpDelays = [0, 16, 48, 100, 200, 350]
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

  getDecorationSpecs() {
    const context = this.context
    const key = context
      ? [
          context.entryId,
          context.currentTitle,
          context.connections,
          context.nodeEntriesInfo,
          context.allTitles,
          context.shinyCandidateMap,
        ]
      : null

    if (
      this.cachedSpecs &&
      this.cachedSpecKey &&
      key &&
      this.cachedSpecKey[0] === key[0] &&
      this.cachedSpecKey[1] === key[1] &&
      this.cachedSpecKey[2] === key[2] &&
      this.cachedSpecKey[3] === key[3] &&
      this.cachedSpecKey[4] === key[4] &&
      this.cachedSpecKey[5] === key[5]
    ) {
      return this.cachedSpecs
    }

    const specs = buildDecorationMatchSpecs(context)
    this.cachedSpecs = specs
    this.cachedSpecKey = key
    return specs
  }

  collectDesiredRanges(specs, searchableText) {
    const desiredRanges = []
    const occurrenceCounts = new Map()
    const { entryId } = this.context

    if (specs.pattern) {
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
    }

    if (specs.wordMap?.size) {
      SIGNIFICANT_WORD_PATTERN.lastIndex = 0
      let wordMatch = SIGNIFICANT_WORD_PATTERN.exec(searchableText)

      while (wordMatch) {
        const word = wordMatch[0]
        const spec = specs.wordMap.get(word.toLowerCase())
        const start = wordMatch.index
        const end = start + word.length
        const overlapsPhrase = desiredRanges.some((range) => start < range.index + range.length && end > range.index)

        if (spec && !overlapsPhrase) {
          const formats = buildFormatsForDecorationSpec(spec, word.toLowerCase(), entryId, occurrenceCounts)
          desiredRanges.push({
            index: start,
            length: word.length,
            formats,
          })
        }

        wordMatch = SIGNIFICANT_WORD_PATTERN.exec(searchableText)
      }
    }

    return desiredRanges
  }

  applyDecorations() {
    if (!this.context?.enabled) {
      return
    }

    const specs = this.getDecorationSpecs()
    const length = Math.max(0, this.quill.getLength() - 1)
    const appliedRanges = []
    const history = this.quill.getModule('history')
    const previousIgnoreChange = history?.ignoreChange

    this.isApplying = true
    // Attribute-only wraps must not be recorded or transformed into undo deltas.
    // Reversing them is what triggers Parchment's optimize loop and insertBefore errors.
    if (history) {
      history.ignoreChange = true
    }

    try {
      if (length === 0 || (!specs.pattern && !specs.wordMap?.size)) {
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
    } catch (error) {
      console.error('Failed to apply text decorations', error)
    } finally {
      if (history) {
        history.ignoreChange = previousIgnoreChange
      }
      this.isApplying = false
    }
  }

  collectExistingDecorationRanges(docLength) {
    const ops = this.quill.getContents()?.ops ?? []
    const ranges = []
    let index = 0

    ops.forEach((op) => {
      const length = typeof op.insert === 'string' ? op.insert.length : 1
      const start = index
      index += length

      if (!op.attributes?.['nyt-deco'] || start >= docLength) {
        return
      }

      const end = Math.min(index, docLength)
      if (end <= start) {
        return
      }

      ranges.push({
        index: start,
        end,
        formats: op.attributes,
      })
    })

    return ranges
  }

  applyFormatDelta(ranges) {
    if (!ranges.length) {
      return
    }

    const Delta = Quill.import('delta')
    const sorted = [...ranges].sort((a, b) => a.index - b.index)
    let delta = new Delta()
    let cursor = 0

    sorted.forEach((range) => {
      if (range.index < cursor || range.length <= 0) {
        return
      }

      if (range.index > cursor) {
        delta = delta.retain(range.index - cursor)
      }

      delta = delta.retain(range.length, range.formats)
      cursor = range.index + range.length
    })

    if (delta.ops.length > 0) {
      this.quill.updateContents(delta, 'silent')
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

    const clearRanges = []
    this.collectExistingDecorationRanges(docLength).forEach((existing) => {
      const matchingDesired = desiredRanges.find(
        (range) =>
          range.index === existing.index &&
          range.index + range.length === existing.end &&
          stableFormatsMatch(existing.formats, range.formats)
      )

      if (!matchingDesired) {
        clearRanges.push({
          index: existing.index,
          length: existing.end - existing.index,
          formats: CLEAR_FORMAT,
        })
      }
    })
    this.applyFormatDelta(clearRanges)

    const formatsToApply = []
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

      formatsToApply.push(range)
      appliedRanges.push({ index: range.index, length: range.length })
    })
    this.applyFormatDelta(formatsToApply)
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
