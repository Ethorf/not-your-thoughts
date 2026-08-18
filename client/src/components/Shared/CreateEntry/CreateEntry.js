import classNames from 'classnames'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'
import QuillDecorationSuggestionMenu from '@components/Shared/CreateEntry/QuillDecorationSuggestionMenu'
import JournalSelectionMenu from '@components/Shared/CreateEntry/JournalSelectionMenu'

// Constants
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { CONNECTION_TYPES } from '@constants/connectionTypes'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import useIsMobile from '@hooks/useIsMobile'

// Redux
import {
  setContent,
  setWordCount,
  setCharCount,
  dismissShinyTextSuggestion,
  fetchShinyTextDismissals,
  createNodeEntry,
  autosaveCurrentEntryIfNeeded,
} from '@redux/reducers/currentEntryReducer'
import { createConnection } from '@redux/reducers/connectionsReducer'
import { ENTRY_TYPES } from '@constants/entryTypes'
import calculateWordCount from '@utils/calculateWordCount'
import { registerQuillSelectionTracking } from '@utils/captureEditorSelection'
import { deriveNodeFromSelectedText } from '@utils/deriveNodeFromSelectedText'
import { showToast } from '@utils/toast'
import { normalizeEntryId } from '@utils/normalizeEntryId'
import {
  getTextDecorationModule,
  registerQuillTextDecorations,
  stripDecorationFromHtml,
} from '@utils/registerQuillTextDecorations'
import { registerQuillClipboardMatchers } from '@utils/registerQuillClipboard'
import { registerQuillListIndentPreservation } from '@utils/registerQuillListIndentPreservation'
import { normalizeQuillHtmlForLoad } from '@utils/normalizeQuillHtmlForLoad'
import { assignOrderedListNumbers, repairQuillListStructure } from '@utils/quillListRepair'
import { clearShinyTextAnimationStarts } from '@utils/shinyTextAnimation'
import {
  buildShinyTextCandidates,
  getConnectedSourceKeys,
  getDismissedSuggestedEntryIds,
  shinyTextCandidatesToMap,
} from '@utils/shinyTextCandidates'

// Styles
import styles from './CreateEntry.module.scss'
import './CustomQuillStyles.scss'

registerQuillTextDecorations()
registerQuillListIndentPreservation()

const { NODE: NODE_ENTRY_TYPE, JOURNAL } = ENTRY_TYPES
const { DIRECT } = CONNECTION_SOURCE_TYPES
const {
  FRONTEND: { PARENT },
} = CONNECTION_TYPES

const CreateEntry = ({ entryType, fillHeight = false }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const quillRef = useRef(null)
  const nodeEntriesInfo = useNodeEntriesInfo()
  const isMobile = useIsMobile()
  const lastSyncedRef = useRef({ entryId: null, content: null })
  const prevSidebarOpenRef = useRef(false)
  const creatingNodeFromSelectionRef = useRef(false)

  const {
    content,
    entryId,
    entriesSaving,
    title: currentTitle,
    shinyTextDismissals,
  } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)
  const { sidebarOpen } = useSelector((state) => state.sidebar)
  const { isOpen: isModalOpen } = useSelector((state) => state.modals)

  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [suggestionMenu, setSuggestionMenu] = useState(null)
  const [journalSelectionMenu, setJournalSelectionMenu] = useState(null)

  const allTitles = useMemo(
    () =>
      nodeEntriesInfo
        ?.map((x) => x?.title?.toLowerCase())
        .filter((t) => t && t !== currentTitle?.toLowerCase()) ?? [],
    [currentTitle, nodeEntriesInfo]
  )

  const connectedSourceKeys = useMemo(
    () => getConnectedSourceKeys(connections, entryId, nodeEntriesInfo),
    [connections, entryId, nodeEntriesInfo]
  )

  const dismissedSuggestedEntryIds = useMemo(
    () => getDismissedSuggestedEntryIds(shinyTextDismissals),
    [shinyTextDismissals]
  )

  const shinyTextCandidates = useMemo(
    () =>
      buildShinyTextCandidates({
        nodeEntriesInfo,
        currentTitle,
        connectedSourceKeys,
        dismissedSuggestedEntryIds,
      }),
    [nodeEntriesInfo, currentTitle, connectedSourceKeys, dismissedSuggestedEntryIds]
  )

  const shinyTextCandidateMap = useMemo(() => shinyTextCandidatesToMap(shinyTextCandidates), [shinyTextCandidates])

  const shinyTextCandidateById = useMemo(
    () => new Map(shinyTextCandidates.map((candidate) => [candidate.id, candidate])),
    [shinyTextCandidates]
  )

  const loadedContent = useMemo(() => normalizeQuillHtmlForLoad(content ?? ''), [content])

  const setTotalWordCount = useCallback(() => {
    const totalWords = calculateWordCount(content)
    dispatch(setWordCount(totalWords))

    if (typeof content === 'string') {
      dispatch(setCharCount(content.length))
    } else {
      dispatch(setCharCount(0))
    }
  }, [content, dispatch])

  const handleContentChange = (html) => {
    dispatch(setContent(normalizeQuillHtmlForLoad(stripDecorationFromHtml(html))))
    setTotalWordCount()
  }

  useEffect(() => {
    if (!entryId || entryType !== NODE_ENTRY_TYPE) {
      return
    }

    dispatch(fetchShinyTextDismissals(entryId))
  }, [dispatch, entryId, entryType])

  useEffect(() => {
    return () => {
      clearShinyTextAnimationStarts(entryId)
    }
  }, [entryId])

  useEffect(() => {
    setTotalWordCount()
  }, [entryId, setTotalWordCount])

  const PLACEHOLDER_COPY = {
    [NODE_ENTRY_TYPE]: 'Start node here...',
    [JOURNAL]: 'Note those thoughts here...',
  }

  const toolBarModules = useMemo(() => {
    const isJournal = entryType === JOURNAL

    const modules = {
      toolbar: isJournal
        ? []
        : [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
          ],
      textDecorations: entryType === NODE_ENTRY_TYPE,
    }

    if (!isJournal) {
      // Cmd/Ctrl+Shift+O → ordered list; Cmd/Ctrl+Shift+U → bullet list
      modules.keyboard = {
        bindings: {
          startOrderedList: {
            key: 'O',
            shortKey: true,
            shiftKey: true,
            handler() {
              const format = this.quill.getFormat()
              this.quill.format('list', format.list === 'ordered' ? false : 'ordered')
              return false
            },
          },
          startUnorderedList: {
            key: 'U',
            shortKey: true,
            shiftKey: true,
            handler() {
              const format = this.quill.getFormat()
              this.quill.format('list', format.list === 'bullet' ? false : 'bullet')
              return false
            },
          },
        },
      }
    }

    return modules
  }, [entryType])

  const handleCreateConnectionFromSuggestion = useCallback(
    async (candidate, connectionType, matchedText) => {
      if (!candidate?.nodeId || !entryId || !connectionType) {
        return
      }

      const suggestedNodeId = candidate.nodeId
      const suggestedTitle = candidate.title || ''
      const matchedSource = matchedText || suggestedTitle
      const isParent = connectionType === PARENT

      await dispatch(
        createConnection({
          connection_type: connectionType,
          current_entry_id: entryId,
          primary_entry_id: isParent ? suggestedNodeId : entryId,
          foreign_entry_id: isParent ? entryId : suggestedNodeId,
          primary_source: isParent ? suggestedTitle : matchedSource,
          foreign_source: isParent ? matchedSource : suggestedTitle,
          source_type: DIRECT,
        })
      )
    },
    [dispatch, entryId]
  )

  const handleDismissShinySuggestion = useCallback(
    (candidate) => {
      if (!candidate?.nodeId || !entryId) {
        return
      }

      dispatch(
        dismissShinyTextSuggestion({
          entryId,
          suggestedEntryId: candidate.nodeId,
        })
      )
    },
    [dispatch, entryId]
  )

  const handleCloseJournalSelectionMenu = useCallback(() => {
    setJournalSelectionMenu(null)
  }, [])

  const handleCreateNodeFromSelection = useCallback(async () => {
    if (creatingNodeFromSelectionRef.current) {
      return
    }

    const derived = deriveNodeFromSelectedText(journalSelectionMenu?.text)
    if (!derived) {
      setJournalSelectionMenu(null)
      return
    }

    creatingNodeFromSelectionRef.current = true
    setJournalSelectionMenu(null)

    try {
      await dispatch(autosaveCurrentEntryIfNeeded())

      const existingNode = nodeEntriesInfo?.find((node) => node.title?.toLowerCase() === derived.title.toLowerCase())
      if (existingNode?.id != null) {
        history.push(`/edit-node-entry?entryId=${existingNode.id}`)
        return
      }

      const result = await dispatch(createNodeEntry({ title: derived.title, content: derived.content }))
      if (createNodeEntry.rejected.match(result)) {
        return
      }

      const newEntryId = normalizeEntryId(result.payload)
      if (newEntryId == null) {
        showToast('Failed to create node', 'error')
        return
      }

      history.push(`/edit-node-entry?entryId=${newEntryId}`)
    } finally {
      creatingNodeFromSelectionRef.current = false
    }
  }, [dispatch, history, journalSelectionMenu, nodeEntriesInfo])

  useEffect(() => {
    if (!quillRef.current) {
      return
    }

    const quill = quillRef.current.getEditor()
    const editorRoot = quill?.root
    if (!editorRoot) {
      return
    }

    // Discourage iOS Safari AutoFill accessory (Passwords / Cards / Locations).
    // Cannot remove the system keyboard dismiss control — that's OS chrome.
    editorRoot.setAttribute('autocomplete', 'off')
    // iOS + contenteditable: `sentences` re-arms caps after any DOM churn from
    // backspace (decoration unwrap / list repair), so the next typed char capitalizes.
    editorRoot.setAttribute('autocapitalize', isMobile ? 'none' : 'sentences')
    editorRoot.setAttribute('spellcheck', 'true')
    editorRoot.setAttribute('data-1p-ignore', 'true')
    editorRoot.setAttribute('data-lpignore', 'true')
    editorRoot.setAttribute('data-form-type', 'other')
    editorRoot.setAttribute('enterkeyhint', 'done')
  }, [entryId, entryType, isMobile])

  // Keep typed lines above the iOS keyboard + autofill accessory bar.
  // iOS often shrinks both innerHeight and visualViewport together, so inset can
  // read as ~0 — cache a baseline height while unfocused and always pad when focused.
  useEffect(() => {
    if (!isMobile || !quillRef.current) {
      return undefined
    }

    const quill = quillRef.current.getEditor()
    const editorRoot = quill?.root
    if (!editorRoot) {
      return undefined
    }

    const ACCESSORY_BAR_PX = 72
    const FOCUSED_BASE_PAD_PX = 280
    const baselineHeightRef = { current: null }
    const isFocusedRef = { current: false }

    const getVisibleHeight = () => {
      const viewport = window.visualViewport
      return viewport?.height ?? window.innerHeight
    }

    const updateKeyboardInset = () => {
      const viewport = window.visualViewport
      const visibleHeight = getVisibleHeight()

      if (!isFocusedRef.current) {
        baselineHeightRef.current = Math.max(
          baselineHeightRef.current ?? 0,
          visibleHeight,
          window.innerHeight,
          document.documentElement.clientHeight
        )
        editorRoot.style.removeProperty('padding-bottom')
        return
      }

      const baseline = baselineHeightRef.current ?? window.innerHeight
      const keyboardInset = Math.max(0, baseline - visibleHeight - (viewport?.offsetTop ?? 0))
      const paddingBottom = Math.max(FOCUSED_BASE_PAD_PX, keyboardInset + ACCESSORY_BAR_PX)

      editorRoot.style.setProperty('padding-bottom', `${paddingBottom}px`, 'important')
    }

    const handleFocus = () => {
      isFocusedRef.current = true
      updateKeyboardInset()
    }

    const handleBlur = () => {
      isFocusedRef.current = false
      updateKeyboardInset()
    }

    updateKeyboardInset()

    const viewport = window.visualViewport
    viewport?.addEventListener('resize', updateKeyboardInset)
    viewport?.addEventListener('scroll', updateKeyboardInset)
    window.addEventListener('resize', updateKeyboardInset)
    editorRoot.addEventListener('focus', handleFocus)
    editorRoot.addEventListener('blur', handleBlur)

    return () => {
      viewport?.removeEventListener('resize', updateKeyboardInset)
      viewport?.removeEventListener('scroll', updateKeyboardInset)
      window.removeEventListener('resize', updateKeyboardInset)
      editorRoot.removeEventListener('focus', handleFocus)
      editorRoot.removeEventListener('blur', handleBlur)
      editorRoot.style.removeProperty('padding-bottom')
    }
  }, [isMobile, entryId, entryType])

  useEffect(() => {
    if (!quillRef.current || content == null) {
      return
    }

    const quill = quillRef.current.getEditor()
    const decorationModule = getTextDecorationModule(quill)

    if (lastSyncedRef.current.entryId !== entryId) {
      lastSyncedRef.current = { entryId, content: null }
    }

    const editorEmpty = !quill.getText().trim()
    const needsSync = editorEmpty && content && lastSyncedRef.current.content !== content

    if (needsSync) {
      quill.setContents(quill.clipboard.convert(normalizeQuillHtmlForLoad(content)), 'silent')
      const structuralChange = repairQuillListStructure(quill.root)

      if (structuralChange) {
        quill.scroll.update()
      }

      assignOrderedListNumbers(quill.root)
      lastSyncedRef.current = { entryId, content }
      decorationModule?.scheduleApply()
    }
  }, [entryId, content])

  useEffect(() => {
    if (!quillRef.current || entryType !== NODE_ENTRY_TYPE) {
      return
    }

    const quill = quillRef.current.getEditor()
    const decorationModule = getTextDecorationModule(quill)

    decorationModule?.setContext({
      enabled: true,
      entryId,
      currentTitle,
      connections,
      nodeEntriesInfo,
      allTitles,
      shinyCandidateMap: shinyTextCandidateMap,
    })
  }, [entryType, entryId, currentTitle, connections, nodeEntriesInfo, allTitles, shinyTextCandidateMap])

  const focusEmptyEditorCaret = useCallback(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    if (!quill.getText().trim()) {
      quill.focus()
      quill.setSelection(0, 0, 'user')
    }
  }, [])

  const handleDecorationClick = useCallback(
    (event) => {
      const target = event.target.closest('[data-nyt-deco]')
      if (!target) {
        return
      }

      const decorationType = target.getAttribute('data-nyt-deco')
      const nodeId = target.getAttribute('data-nyt-node-id')

      if (decorationType === 'connection-internal' || decorationType === 'shiny') {
        event.preventDefault()
        if (nodeId) {
          history.push(`/edit-node-entry?entryId=${nodeId}`)
        }
        return
      }

      if (decorationType === 'connection-external') {
        event.preventDefault()
        const href = target.getAttribute('data-nyt-href')
        if (href) {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
        return
      }

      if (decorationType === 'shiny-suggestion') {
        event.preventDefault()
        event.stopPropagation()

        const candidateId = target.getAttribute('data-nyt-cand-id')
        const candidate = candidateId ? shinyTextCandidateById.get(candidateId) : null
        if (!candidate) {
          return
        }

        const rect = target.getBoundingClientRect()
        setSuggestionMenu({
          left: rect.left,
          top: rect.bottom + 6,
          candidateId,
          matchedText: target.textContent || '',
        })
      }
    },
    [history, shinyTextCandidateById]
  )

  useEffect(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    registerQuillSelectionTracking(quill)

    const handleEditorMouseDown = () => {
      requestAnimationFrame(focusEmptyEditorCaret)
    }

    const handleClick = (e) => {
      if (e.target?.closest('[data-nyt-deco]')) {
        handleDecorationClick(e)
        return
      }

      if (e.target && e.target.tagName === 'A') {
        e.preventDefault()
        window.open(e.target.getAttribute('href'), '_blank')
      }
    }

    const handleTextChange = (_delta, _oldDelta, source) => {
      if (source !== 'user') {
        return
      }

      requestAnimationFrame(() => {
        const structuralChange = repairQuillListStructure(quill.root)

        if (structuralChange) {
          quill.scroll.update()
        }

        assignOrderedListNumbers(quill.root)
        getTextDecorationModule(quill)?.scheduleApply()
      })
    }

    quill.on('text-change', handleTextChange)

    registerQuillClipboardMatchers(quill)
    assignOrderedListNumbers(quill.root)

    quill.root.addEventListener('mousedown', handleEditorMouseDown)
    quill.root.addEventListener('click', handleClick)
    return () => {
      quill.off('text-change', handleTextChange)
      quill.root.removeEventListener('mousedown', handleEditorMouseDown)
      quill.root.removeEventListener('click', handleClick)
    }
  }, [focusEmptyEditorCaret, handleDecorationClick, entryId])

  useEffect(() => {
    if (entryType !== JOURNAL || !quillRef.current) {
      return undefined
    }

    const quill = quillRef.current.getEditor()
    let debounceId = null

    const getMenuFromCurrentSelection = () => {
      const range = quill.getSelection()
      if (!range || range.length < 1) {
        return null
      }

      const text = quill.getText(range.index, range.length).replace(/\n$/, '').trim()
      if (!text) {
        return null
      }

      const bounds = quill.getBounds(range.index, range.length)
      const containerRect = quill.container.getBoundingClientRect()
      const menuWidth = 230
      const left = Math.min(Math.max(8, containerRect.left + bounds.left), window.innerWidth - menuWidth - 8)
      const top = Math.min(Math.max(8, containerRect.top + bounds.bottom + 8), window.innerHeight - 72)

      return { left, top, text }
    }

    const showMenu = () => {
      const nextMenu = getMenuFromCurrentSelection()
      if (nextMenu) {
        setJournalSelectionMenu(nextMenu)
      }
    }

    const handlePointerUp = () => {
      window.requestAnimationFrame(showMenu)
    }

    const handleEditorPointerDown = () => {
      setJournalSelectionMenu(null)
    }

    const handleSelectionChange = (range) => {
      window.clearTimeout(debounceId)
      if (!range || range.length < 1) {
        return
      }

      debounceId = window.setTimeout(showMenu, 350)
    }

    const handleTextChange = (_delta, _oldDelta, source) => {
      if (source === 'user') {
        setJournalSelectionMenu(null)
      }
    }

    quill.on('selection-change', handleSelectionChange)
    quill.on('text-change', handleTextChange)
    quill.root.addEventListener('mousedown', handleEditorPointerDown)
    quill.root.addEventListener('touchstart', handleEditorPointerDown)
    quill.root.addEventListener('mouseup', handlePointerUp)
    quill.root.addEventListener('touchend', handlePointerUp)

    return () => {
      window.clearTimeout(debounceId)
      quill.off('selection-change', handleSelectionChange)
      quill.off('text-change', handleTextChange)
      quill.root.removeEventListener('mousedown', handleEditorPointerDown)
      quill.root.removeEventListener('touchstart', handleEditorPointerDown)
      quill.root.removeEventListener('mouseup', handlePointerUp)
      quill.root.removeEventListener('touchend', handlePointerUp)
    }
  }, [entryType, entryId])

  useEffect(() => {
    const wasOpen = prevSidebarOpenRef.current
    prevSidebarOpenRef.current = sidebarOpen

    // Restore caret only when the sidebar closes — not on mount (autofocus zooms iOS).
    if (!wasOpen || sidebarOpen || isMobile || !quillRef.current) {
      return
    }

    const quill = quillRef.current.getEditor()
    quill.focus()
    const length = quill.getLength()
    quill.setSelection(length, length)
  }, [sidebarOpen, isMobile])

  const activeSuggestionCandidate = suggestionMenu?.candidateId
    ? shinyTextCandidateById.get(suggestionMenu.candidateId)
    : null

  return (
    <div
      className={classNames(styles.wrapper, entryType === JOURNAL && styles.journalWrapper, {
        [styles.toolbarVisibleWrapper]: toolbarVisible,
        [styles.fillHeight]: fillHeight,
        'create-entry-fill': fillHeight,
      })}
    >
      {entryType === NODE_ENTRY_TYPE && (
        <TextButton
          className={styles.toolbarToggleButton}
          tooltip={'Toggle formatting toolbar'}
          onClick={() => setToolbarVisible(!toolbarVisible)}
        >
          {toolbarVisible ? 'X' : '+'}
        </TextButton>
      )}
      <div className={styles.editorContainer}>
        <ReactQuill
          key={entryId ?? 'new-entry'}
          className={`textArea ${
            entryType === JOURNAL
              ? 'noScroll visibleText toolbar-hidden'
              : toolbarVisible
                ? 'toolbar-visible visibleText'
                : 'toolbar-hidden visibleText'
          }`}
          modules={toolBarModules}
          placeholder={PLACEHOLDER_COPY[entryType]}
          defaultValue={loadedContent}
          onChange={handleContentChange}
          ref={quillRef}
          readOnly={entriesSaving}
        />
        {entriesSaving && !isModalOpen && <div className={styles.savingOverlay} />}
      </div>
      {entryType === NODE_ENTRY_TYPE && (
        <QuillDecorationSuggestionMenu
          menuState={suggestionMenu}
          candidate={activeSuggestionCandidate}
          matchedText={suggestionMenu?.matchedText}
          onDismiss={handleDismissShinySuggestion}
          onCreateConnection={handleCreateConnectionFromSuggestion}
          onClose={() => setSuggestionMenu(null)}
        />
      )}
      {entryType === JOURNAL && (
        <JournalSelectionMenu
          menuState={journalSelectionMenu}
          onCreateNode={handleCreateNodeFromSelection}
          onClose={handleCloseJournalSelectionMenu}
        />
      )}
    </div>
  )
}

export default CreateEntry
