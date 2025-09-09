import classNames from 'classnames'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import Delta from 'quill-delta'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import FormattedTextOverlay from '@components/Shared/FormattedTextOverlay/FormattedTextOverlay'

// Redux
import { setContent, setWordCount, setCharCount } from '@redux/reducers/currentEntryReducer'
import { ENTRY_TYPES } from '@constants/entryTypes'

// Styles
import styles from './CreateEntry.module.scss'
import './CustomQuillStyles.scss'

const { NODE, JOURNAL } = ENTRY_TYPES

const CreateEntry = ({ entryType }) => {
  const dispatch = useDispatch()
  const quillRef = useRef(null)

  const { content, entriesLoading, entryId } = useSelector((state) => state.currentEntry)
  const { sidebarOpen } = useSelector((state) => state.sidebar)

  const [toolbarVisible, setToolbarVisible] = useState(false)

  const setTotalWordCount = useCallback(() => {
    const wordsAmount = content?.split(/\s+/).filter((word) => word?.length > 0)
    wordsAmount?.length && dispatch(setWordCount(wordsAmount.length))
    content?.length && dispatch(setCharCount(content.length))
  }, [content, dispatch])

  const handleContentChange = (e) => {
    dispatch(setContent(e))
    setTotalWordCount()
  }

  useEffect(() => {
    setTotalWordCount()
  }, [entryId, setTotalWordCount])

  const PLACEHOLDER_COPY = {
    [NODE]: 'Start node here...',
    [JOURNAL]: 'Note those thoughts here...',
  }

  const toolBarModules = {
    toolbar:
      entryType === JOURNAL
        ? []
        : [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
          ],
  }

  useEffect(() => {
    if (!sidebarOpen && quillRef.current) {
      const quill = quillRef.current.getEditor()
      quill.focus()
      const length = quill.getLength()
      quill.setSelection(length, length)
    }
  }, [sidebarOpen])

  // Add a click handler to the quill editor so that links open when clicked
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      const handleClick = (e) => {
        if (e.target && e.target.tagName === 'A') {
          e.preventDefault()
          window.open(e.target.getAttribute('href'), '_blank')
        }
      }

      // Clear existing matchers (optional if you only want to override specific ones)
      quill.clipboard.matchers = []

      // Add a matcher that replaces everything with plain text
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        const text = node.innerText || node.textContent || ''
        return new Delta().insert(text)
      })

      quill.root.addEventListener('click', handleClick)
      return () => quill.root.removeEventListener('click', handleClick)
    }
  }, [quillRef])

  return (
    <div className={classNames(styles.wrapper, entryType === JOURNAL && styles.journalWrapper)}>
      {entryType === NODE && (
        <TextButton
          className={styles.toolbarToggleButton}
          tooltip={'Toggle formatting toolbar'}
          onClick={() => setToolbarVisible(!toolbarVisible)}
        >
          {toolbarVisible ? 'X' : '+'}
        </TextButton>
      )}
      {entriesLoading ? (
        <SmallSpinner />
      ) : (
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
            value={content}
            onChange={handleContentChange}
            ref={quillRef}
          />
        </div>
      )}
    </div>
  )
}

export default CreateEntry
