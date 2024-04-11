import React from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'

// Utils
import { parseDate } from '../../utils/parseDate'
import { formatTime } from '../../utils/formatTime.js'

import { setEntryById } from '../../redux/reducers/currentEntryReducer'
import { openModal } from '../../redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '../../constants/modalNames.js'

import styles from './JournalEntry.module.scss'

export const JournalEntry = ({ journal: { id, date_created, num_of_words, content, total_time_taken, wpm } }) => {
  const dispatch = useDispatch()

  const handleOpenContentModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.JOURNAL_CONTENT))
  }

  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Date: {parseDate(date_created)}</div>
      <div onClick={handleOpenContentModal} className={classNames(styles.nodeValue, styles.contentButton)}>
        Content: {content.length ? content[0].slice(0, 15) : 'Invalid Content'}...
      </div>
      <div className={styles.nodeValue}># of Words: {num_of_words}</div>
      <div className={styles.nodeValue}>Time taken: {formatTime(total_time_taken)}</div>
      <div className={styles.nodeValue}>WPM: {wpm}</div>
    </li>
  )
}
