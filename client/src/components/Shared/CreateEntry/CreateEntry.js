import classNames from 'classnames'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import Delta from 'quill-delta'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'
import FormattedTextOverlay from '@components/Shared/FormattedTextOverlay/FormattedTextOverlay'

// Redux
import { setContent, setWordCount, setCharCount } from '@redux/reducers/currentEntryReducer'
import { ENTRY_TYPES } from '@constants/entryTypes'
import calculateWordCount from '@utils/calculateWordCount'
import { registerQuillSelectionTracking } from '@utils/captureEditorSelection'
import {
  registerQuillNestedLists,
  quillKeyboardBindings,
} from '@utils/registerQuillNestedLists'
import { normalizeQuillListHtml, mergeAdjacentOrderedListsInDom } from '@utils/normalizeQuillListHtml'
import styles from './CreateEntry.module.scss'
import './CustomQuillStyles.scss'

registerQuillNestedLists()

const { NODE, JOURNAL } = ENTRY_TYPES

const CreateEntry = ({ entryType }) => {
  const dispatch = useDispatch()
  const quillRef = useRef(null)

  const { content, entryId, entriesSaving } = useSelector((state) => state.currentEntry)
  const { sidebarOpen } = useSelector((state) => state.sidebar)
  const { isOpen: isModalOpen } = useSelector((state) => state.modals)

  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [localContent, setLocalContent] = useState(content || '')
  const lastEntryIdRef = useRef(entryId)

  const setTotalWordCount = useCallback(() => {
    const totalWords = calculateWordCount(content)
    dispatch(setWordCount(totalWords))

    if (typeof content === 'string') {
      dispatch(setCharCount(content.length))
    } else {
      dispatch(setCharCount(0))
    }
  }, [content, dispatch])

  const handleContentChange = (e) => {
    setLocalContent(e)
    dispatch(setContent(e))
    setTotalWordCount()
  }

  const syncRepairedListContent = useCallback(
    (quill) => {
      const repairedHtml = normalizeQuillListHtml(quill.root.innerHTML)
      if (repairedHtml === quill.root.innerHTML) {
        return false
      }

      quill.root.innerHTML = repairedHtml
      quill.scroll.update()
      quill.scroll.optimize()
      setLocalContent(repairedHtml)
      dispatch(setContent(repairedHtml))
      return true
    },
    [dispatch]
  )

  // Sync local editor from Redux when entryId changes, including empty content (e.g. new journal vs prior node).
  useEffect(() => {
    if (entryId !== lastEntryIdRef.current) {
      setLocalContent(normalizeQuillListHtml(content ?? ''))
      lastEntryIdRef.current = entryId
    } else if (entryId && content && !localContent) {
      // Same entry, but content loaded for the first time
      setLocalContent(normalizeQuillListHtml(content))
    }
  }, [entryId, content, localContent])

  useEffect(() => {
    setTotalWordCount()
  }, [entryId, setTotalWordCount])

  const PLACEHOLDER_COPY = {
    [NODE]: 'Start node here...',
    [JOURNAL]: 'Note those thoughts here...',
  }

  const toolBarModules = useMemo(
    () => ({
      toolbar:
        entryType === JOURNAL
          ? []
          : {
              container: [
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
              ],
              handlers: {
                list: function handleListFormat(value) {
                  const formats = this.quill.getFormat()

                  if (formats.list === value) {
                    this.quill.format('list', false, 'user')
                    return
                  }

                  this.quill.format('list', value, 'user')
                },
              },
            },
      keyboard: {
        bindings: quillKeyboardBindings,
      },
    }),
    [entryType]
  )

  const focusEmptyEditorCaret = useCallback(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    if (!quill.getText().trim()) {
      quill.focus()
      quill.setSelection(0, 0, 'user')
    }
  }, [])

  useEffect(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    registerQuillSelectionTracking(quill)

    const handleEditorMouseDown = () => {
      requestAnimationFrame(focusEmptyEditorCaret)
    }

    const handleClick = (e) => {
      if (e.target && e.target.tagName === 'A') {
        e.preventDefault()
        window.open(e.target.getAttribute('href'), '_blank')
      }
    }

    quill.clipboard.matchers = []
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      const text = node.innerText || node.textContent || ''
      return new Delta().insert(text)
    })

    quill.root.addEventListener('mousedown', handleEditorMouseDown)
    quill.root.addEventListener('click', handleClick)

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== 'user') {
        return
      }

      requestAnimationFrame(() => {
        if (!quillRef.current) {
          return
        }

        const selection = quill.getSelection()
        const merged = mergeAdjacentOrderedListsInDom(quill.root)

        if (merged) {
          syncRepairedListContent(quill)
          if (selection) {
            quill.setSelection(selection.index, selection.length, 'silent')
          }
        }
      })
    }

    quill.on('text-change', handleTextChange)

    return () => {
      quill.off('text-change', handleTextChange)
      quill.root.removeEventListener('mousedown', handleEditorMouseDown)
      quill.root.removeEventListener('click', handleClick)
    }
  }, [focusEmptyEditorCaret, entryId, syncRepairedListContent])

  useEffect(() => {
    if (!quillRef.current) {
      return
    }

    const quill = quillRef.current.getEditor()
    requestAnimationFrame(() => {
      if (mergeAdjacentOrderedListsInDom(quill.root)) {
        syncRepairedListContent(quill)
      }
    })
  }, [entryId, localContent, syncRepairedListContent])

  useEffect(() => {
    if (!sidebarOpen && quillRef.current) {
      const quill = quillRef.current.getEditor()
      quill.focus()
      const length = quill.getLength()
      quill.setSelection(length, length)
    }
  }, [sidebarOpen])
  console.log('<<<<<< toolbarVisible >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(toolbarVisible)
  return (
    <div
      className={classNames(styles.wrapper, entryType === JOURNAL && styles.journalWrapper, {
        [styles.toolbarVisiblWrapper]: toolbarVisible,
      })}
    >
      {entryType === NODE && (
        <TextButton
          className={styles.toolbarToggleButton}
          tooltip={'Toggle formatting toolbar'}
          onClick={() => setToolbarVisible(!toolbarVisible)}
        >
          {toolbarVisible ? 'X' : '+'}
        </TextButton>
      )}
      <div className={styles.editorContainer}>
        {entryType === NODE ? <FormattedTextOverlay quillRef={quillRef} toolbarVisible={toolbarVisible} /> : null}
        <ReactQuill
          className={`textArea ${
            entryType === JOURNAL
              ? 'noScroll visibleText toolbar-hidden'
              : toolbarVisible
                ? 'toolbar-visible hiddenText'
                : 'toolbar-hidden hiddenText'
          }`}
          modules={toolBarModules}
          placeholder={PLACEHOLDER_COPY[entryType]}
          value={localContent}
          onChange={handleContentChange}
          ref={quillRef}
          readOnly={entriesSaving}
        />
        {entriesSaving && !isModalOpen && <div className={styles.savingOverlay} />}
      </div>
    </div>
  )
}

export default CreateEntry
