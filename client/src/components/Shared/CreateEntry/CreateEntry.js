import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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

const CreateEntry = ({ type }) => {
  const dispatch = useDispatch()
  const quillRef = useRef(null)

  const { content, entriesLoading, entryId } = useSelector((state) => state.currentEntry)
  const { sidebarOpen } = useSelector((state) => state.sidebar)

  const [toolbarVisible, setToolbarVisible] = useState(false)

  const setTotalWordCount = () => {
    const wordsAmount = content?.split(/\s+/).filter((word) => word?.length > 0)
    wordsAmount?.length && dispatch(setWordCount(wordsAmount.length))
    content?.length && dispatch(setCharCount(content.length))
  }

  const handleContentChange = (e) => {
    dispatch(setContent(e))
    setTotalWordCount()
  }

  useEffect(() => {
    setTotalWordCount()
  }, [entryId])

  const PLACEHOLDER_COPY = {
    [ENTRY_TYPES.NODE]: 'Start node here...',
    [ENTRY_TYPES.JOURNAL]: 'Note those thoughts here...',
  }

  const toolBarModules = {
    toolbar: [
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

  // Add a click handler so that links open when clicked
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      const handleClick = (e) => {
        if (e.target && e.target.tagName === 'A') {
          e.preventDefault()
          window.open(e.target.getAttribute('href'), '_blank')
        }
      }
      quill.root.addEventListener('click', handleClick)
      return () => quill.root.removeEventListener('click', handleClick)
    }
  }, [quillRef])

  return (
    <div className={styles.wrapper}>
      {entriesLoading ? (
        <SmallSpinner />
      ) : (
        <>
          <ReactQuill
            className={`textArea ${toolbarVisible ? 'toolbar-visible' : 'toolbar-hidden'} ${
              type === ENTRY_TYPES.JOURNAL ? 'noScroll' : ''
            }`}
            modules={toolBarModules}
            placeholder={PLACEHOLDER_COPY[type]}
            value={content}
            onChange={handleContentChange}
            ref={quillRef}
          />
          <FormattedTextOverlay toolbarVisible={toolbarVisible} />
          <TextButton
            className={styles.toolbarToggleButton}
            tooltip={'Toggle formatting toolbar'}
            onClick={() => setToolbarVisible(!toolbarVisible)}
          >
            {toolbarVisible ? 'X' : '+'}
          </TextButton>
        </>
      )}
    </div>
  )
}

export default CreateEntry
