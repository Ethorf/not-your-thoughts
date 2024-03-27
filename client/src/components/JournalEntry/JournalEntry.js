import React from 'react'

import { parseDate } from '../../utils/parseDate'
import styles from './JournalEntry.module.scss'

export const JournalEntry = ({ journal: { id, date_created, num_of_words, content } }) => {
  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Date: {parseDate(date_created)}</div>
      <div className={styles.nodeValue}>Content: {content[0]}</div>
      <div className={styles.nodeValue}># of Words: {num_of_words}</div>
    </li>
  )
}
