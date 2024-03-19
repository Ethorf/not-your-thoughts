import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setContent, setWordCount, setCharCount } from '../../../redux/reducers/currentEntryReducer' // Replace with the correct path
import { ENTRY_TYPES } from '../../../constants/entryTypes'

import styles from './CreateEntry.module.scss'

const CreateEntry = ({ type }) => {
  const dispatch = useDispatch()
  const { content } = useSelector((state) => state.currentEntry)

  const handleContentChange = (e) => {
    dispatch(setContent(e.target.value))

    // Calculate word count
    const words = content.split(/\s+/).filter((word) => word.length > 0)
    dispatch(setWordCount(words.length))

    dispatch(setCharCount(content.length))
  }

  const PLACEHOLDER_COPY = {
    [ENTRY_TYPES.NODE]: 'Start node here...',
    [ENTRY_TYPES.JOURNAL]: 'Note those thoughts here...',
  }
  return (
    <textarea
      placeholder={PLACEHOLDER_COPY[type]}
      className={styles.textArea}
      value={content}
      onChange={handleContentChange}
    />
  )
}

export default CreateEntry
