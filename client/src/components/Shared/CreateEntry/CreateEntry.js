import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import TextButton from '@components/Shared/TextButton/TextButton'

import { setContent, setWordCount, setCharCount } from '@redux/reducers/currentEntryReducer' // Replace with the correct path
import { ENTRY_TYPES } from '@constants/entryTypes'

import styles from './CreateEntry.module.scss'
import './CustomQuillStyles.scss'

const CreateEntry = ({ type }) => {
  const dispatch = useDispatch()
  const { content } = useSelector((state) => state.currentEntry)
  const [toolbarVisible, setToolbarVisible] = useState(false)

  const handleContentChange = (e) => {
    dispatch(setContent(e))

    // Calculate word count
    const words = content.split(/\s+/).filter((word) => word.length > 0)
    dispatch(setWordCount(words.length))

    dispatch(setCharCount(content.length))
  }

  const PLACEHOLDER_COPY = {
    [ENTRY_TYPES.NODE]: 'Start node here...',
    [ENTRY_TYPES.JOURNAL]: 'Note those thoughts here...',
  }

  const toolBarModules = {
    toolbar: [
      [],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      [],
    ],
  }

  return (
    <div className={styles.wrapper}>
      <ReactQuill
        className={`textArea ${toolbarVisible ? 'toolbar-visible' : 'toolbar-hidden'} ${
          type === ENTRY_TYPES.JOURNAL ? 'noScroll' : null
        }`}
        modules={toolBarModules}
        placeholder={PLACEHOLDER_COPY[type]}
        value={content}
        onChange={(e) => handleContentChange(e)}
      />
      <TextButton
        className={styles.toolbarToggleButton}
        tooltip={'Toggle formatting toolbar'}
        onClick={() => setToolbarVisible(!toolbarVisible)}
      >
        {toolbarVisible ? 'X' : '+'}
      </TextButton>
    </div>
  )
}

export default CreateEntry
