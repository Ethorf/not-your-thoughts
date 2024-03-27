import React from 'react'
import { parseDate } from '../../utils/parseDate'
import { formatTime } from '../../utils/formatTime.js'

import styles from './JournalEntry.module.scss'

export const JournalEntry = ({ journal: { id, date_created, num_of_words, content, total_time_taken, wpm } }) => {
  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Date: {parseDate(date_created)}</div>
      <div className={styles.nodeValue}>Content: {content[0]}</div>
      <div className={styles.nodeValue}># of Words: {num_of_words}</div>
      <div className={styles.nodeValue}>Time taken: {formatTime(total_time_taken)}</div>
      <div className={styles.nodeValue}>WPM: {wpm}</div>
    </li>
  )
}
