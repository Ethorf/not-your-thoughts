import { hasOneWord } from '@utils/hasOneWord'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'

const { PRIMARY, FOREIGN } = CONNECTION_ENTRY_SOURCES

const READOUT_SELECTOR = '[data-connection-source-readout]'

/** Last non-empty Quill selection (survives editor blur when opening modals). */
let lastQuillSelection = null

/** Last selection inside a connections-modal content readout. */
let lastModalReadoutSelection = null

/** Editor selection captured immediately before the connections modal opens. */
let pendingEditorSelectionForModal = null

const isNodeInQuillEditor = (node) => {
  if (!node) return false
  return Array.from(document.querySelectorAll('.ql-editor')).some((editorEl) => editorEl.contains(node))
}

export const clearCapturedSelectionState = () => {
  lastModalReadoutSelection = null
  lastQuillSelection = null
}

export const clearPendingEditorSelectionForModal = () => {
  pendingEditorSelectionForModal = null
}

/**
 * Store editor selection for the next connections modal open (Connect mousedown / shortcut).
 * Only captures from the Quill body — not the title field or modal readout.
 */
export const setPendingEditorSelectionForModal = () => {
  pendingEditorSelectionForModal = captureQuillEditorSelectionOnly()
}

/**
 * @param {string} [entryTitle] - If the captured text equals the entry title, treat as no selection.
 */
export const consumePendingEditorSelectionForModal = (entryTitle) => {
  const pending = pendingEditorSelectionForModal
  pendingEditorSelectionForModal = null
  if (!pending?.plainText) return null

  const entryTitleTrimmed = entryTitle?.trim()
  if (entryTitleTrimmed && pending.plainText.trim() === entryTitleTrimmed) {
    return null
  }

  return pending
}

/** Clears in-memory selection tracking and any active browser selection. */
export const resetConnectionModalSelectionState = () => {
  clearPendingEditorSelectionForModal()
  clearCapturedSelectionState()
  window.getSelection()?.removeAllRanges()
}

const findReadoutAncestor = (node) => {
  let el = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement
  while (el) {
    if (el.matches?.(READOUT_SELECTOR)) return el
    el = el.parentElement
  }
  return null
}

const toCaptureResult = (plainText) => {
  const trimmed = plainText?.trim()
  if (!trimmed) return null
  return { plainText: trimmed, isSingleWord: hasOneWord(trimmed) }
}

const captureWindowSelectionInReadout = (readoutType) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null

  const range = selection.getRangeAt(0)
  const readout = findReadoutAncestor(range.commonAncestorContainer)
  if (!readout || readout.dataset.readoutType !== readoutType) return null

  return toCaptureResult(selection.toString())
}

if (typeof document !== 'undefined') {
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection()
    if (!selection?.rangeCount || selection.isCollapsed) return

    const range = selection.getRangeAt(0)
    const readout = findReadoutAncestor(range.commonAncestorContainer)
    if (!readout?.dataset.readoutType) return

    const plainText = selection.toString().trim()
    if (!plainText) return

    lastModalReadoutSelection = {
      readoutType: readout.dataset.readoutType,
      plainText,
    }
  })
}

/**
 * Track selection changes on a Quill instance (call once when the editor mounts).
 * @param {import('quill').default} quill
 */
export const registerQuillSelectionTracking = (quill) => {
  if (!quill || quill.__selectionTrackingRegistered) return
  quill.__selectionTrackingRegistered = true

  quill.on('selection-change', (range) => {
    if (range && range.length > 0) {
      lastQuillSelection = { quill, range: { index: range.index, length: range.length } }
    }
  })
}

const readPlainTextFromQuillRange = (quill, range) => {
  if (!quill || !range?.length) return ''
  return quill.getText(range.index, range.length).replace(/\n$/, '').trim()
}

/** Capture selection from the Quill editor only (not title inputs or modal readouts). */
export const captureQuillEditorSelectionOnly = () => {
  const selection = window.getSelection()
  if (selection?.rangeCount && !selection.isCollapsed) {
    const range = selection.getRangeAt(0)
    if (isNodeInQuillEditor(range.commonAncestorContainer)) {
      const plainText = selection.toString().trim()
      const result = toCaptureResult(plainText)
      if (result) return result
    }
  }

  if (lastQuillSelection?.quill && lastQuillSelection.range?.length > 0) {
    const plainText = readPlainTextFromQuillRange(lastQuillSelection.quill, lastQuillSelection.range)
    if (plainText) return toCaptureResult(plainText)
  }

  return null
}

const captureQuillSelection = () => captureQuillEditorSelectionOnly()

/**
 * Capture selected text from a connections-modal readout or the node editor (Quill).
 * @param {string} [entrySource] - CONNECTION_ENTRY_SOURCES.PRIMARY | FOREIGN
 * @returns {{ plainText: string, isSingleWord: boolean } | null}
 */
export const captureEditorSelection = (entrySource) => {
  const readoutType = entrySource === FOREIGN ? FOREIGN : entrySource === PRIMARY ? PRIMARY : null

  if (readoutType) {
    const fromReadoutWindow = captureWindowSelectionInReadout(readoutType)
    if (fromReadoutWindow) return fromReadoutWindow

    if (lastModalReadoutSelection?.readoutType === readoutType && lastModalReadoutSelection.plainText) {
      return toCaptureResult(lastModalReadoutSelection.plainText)
    }
  }

  if (entrySource === FOREIGN) {
    return null
  }

  return captureQuillSelection()
}
