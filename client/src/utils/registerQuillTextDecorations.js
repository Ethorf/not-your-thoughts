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

const SHINY_ANIMATION_DURATION_SEC = 3

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

class TextDecorationModule {
  constructor(quill, options = {}) {
    this.quill = quill
    this.options = options
    this.context = null
    this.debounceId = null
    this.isApplying = false
    this.pendingSelection = null
    this.lastCaret = null
    this.isComposing = false

    this.quill.on('text-change', this.handleTextChange)
    this.quill.on('selection-change', this.handleSelectionChange)

    this.quill.root.addEventListener('compositionstart', this.handleCompositionStart)
    this.quill.root.addEventListener('compositionend', this.handleCompositionEnd)
  }

  handleSelectionChange = (range, _oldRange, source) => {
    if (range && source === 'user') {
      this.lastCaret = { index: range.index, length: range.length }
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
      this.pendingSelection = { index: liveSelection.index, length: liveSelection.length }
      this.lastCaret = this.pendingSelection
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
      this.pendingSelection = {
        index,
        length: liveSelection?.length ?? this.lastCaret?.length ?? 0,
      }
      this.lastCaret = this.pendingSelection
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
    }, 80)
  }

  resolveRestoreSelection(appliedRanges) {
    const base = this.pendingSelection ?? this.lastCaret ?? this.quill.getSelection()
    const selection = clampSelectionRange(this.quill, base)

    if (!selection) {
      return null
    }

    let restoreIndex = selection.index
    const restoreLength = selection.length

    appliedRanges.forEach(({ index, length }) => {
      const rangeEnd = index + length
      if (restoreIndex > index && restoreIndex < rangeEnd) {
        restoreIndex = rangeEnd
      }
    })

    if (this.lastCaret?.length === 0) {
      restoreIndex = Math.max(restoreIndex, this.lastCaret.index)
    }

    return clampSelectionRange(this.quill, { index: restoreIndex, length: restoreLength })
  }

  restoreSelectionIfNeeded(appliedRanges = []) {
    const selection = this.resolveRestoreSelection(appliedRanges)
    if (!selection) {
      return
    }

    const current = this.quill.getSelection()
    if (current && current.length === 0 && current.index > selection.index) {
      return
    }

    if (!current || current.index !== selection.index || current.length !== selection.length) {
      this.quill.setSelection(selection.index, selection.length, 'silent')
    }
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
      this.clearDecorations()

      if (length === 0 || !specs.pattern) {
        this.restoreSelectionIfNeeded(appliedRanges)
        return
      }

      const text = this.quill.getText()
      const searchableText = text.endsWith('\n') ? text.slice(0, -1) : text
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
          this.quill.formatText(match.index, word.length, formats, 'silent')
          appliedRanges.push({ index: match.index, length: word.length })
        }

        match = specs.pattern.exec(searchableText)
      }

      this.applyShinyAnimationDelays()
      this.restoreSelectionIfNeeded(appliedRanges)
    } finally {
      this.isApplying = false
      this.pendingSelection = null
    }
  }

  clearDecorations() {
    const length = Math.max(0, this.quill.getLength() - 1)
    if (length === 0) {
      return
    }

    let index = 0
    while (index < length) {
      const formats = this.quill.getFormat(index, 1)

      if (!formats['nyt-deco']) {
        index += 1
        continue
      }

      let end = index + 1
      while (end < length) {
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

      this.quill.formatText(index, end - index, CLEAR_FORMAT, 'silent')
      index = end
    }
  }

  applyShinyAnimationDelays() {
    this.quill.root
      .querySelectorAll('[data-nyt-deco="shiny"], [data-nyt-deco="shiny-suggestion"]')
      .forEach((element) => {
        const animationId = element.getAttribute('data-nyt-anim')
        const delay = getShinyTextAnimationDelay(animationId, SHINY_ANIMATION_DURATION_SEC)

        if (delay) {
          element.style.animationDelay = delay
        }
      })
  }

  destroy() {
    clearTimeout(this.debounceId)
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

const DECORATION_SELECTOR = '[data-nyt-deco], [data-nyt-node-id], [data-nyt-anim], [data-nyt-href], [data-nyt-conn], [data-nyt-cand-id]'

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
