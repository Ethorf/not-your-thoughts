import React from 'react'
import { EditPencil } from '../Shared/EditPencil/EditPencil'
import { useHistory } from 'react-router-dom'

import { parseDate } from '../../utils/parseDate'
import styles from './JournalEntry.module.scss'

export const JournalEntry = ({ journal: { id, date_created, num_of_words, content } }) => {
  const history = useHistory()

  //   const handleEditNode = () => {
  //     history.push(`/edit-node-entry?entryId=${id}`)
  //   }

  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Date: {parseDate(date_created)}</div>
      <div className={styles.nodeValue}>Content: {content[0]}</div>
      <div className={styles.nodeValue}># of Words: {num_of_words}</div>

      {/* <div className={styles.editContainer}>
        <EditPencil onClick={handleEditNode} className={styles.editButton} />
      </div> */}
    </li>
  )
}
