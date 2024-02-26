import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setContent, setWordCount, setCharCount } from '../../../redux/reducers/currentEntryReducer' // Replace with the correct path

import styles from './CreateEntry.module.scss'

const CreateEntry = () => {
  const dispatch = useDispatch()
  const { wordCount, charCount, content } = useSelector((state) => state.currentEntry)

  const handleContentChange = (e) => {
    dispatch(setContent(e.target.value))

    // Calculate word count
    const words = content.split(/\s+/).filter((word) => word.length > 0)
    dispatch(setWordCount(words.length))

    // Calculate character count
    dispatch(setCharCount(content.length))
  }

  return (
    // <div>
    //   <div>
    //     <label>Category:</label> <p>Word Count: {wordCount}</p>
    //     <input type="text" value={categories} onChange={handleCategoriesChange} />
    //   </div>
    //   <div>
    <textarea className={styles.textArea} value={content} onChange={handleContentChange} />
    //   </div>
    // </div>
  )
}

export default CreateEntry
