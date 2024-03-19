import React from 'react'
import { EditPencil } from '../Shared/EditPencil/EditPencil'
import { useHistory } from 'react-router-dom'

import { parseDate } from '../../utils/parseDate'
import styles from './NodeEntry.module.scss'

export const NodeEntry = ({ node: { id, date, title, content, category_name } }) => {
  const history = useHistory()

  const handleEditNode = () => {
    history.push(`/edit-node-entry?entryId=${id}`)
  }

  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Title: {title}</div>
      <div className={styles.nodeValue}>Last Modified: {parseDate(date[0])}</div>
      <div className={styles.nodeValue}>Category: {category_name ?? 'n/a'}</div>
      <div className={styles.nodeValue}>Content: {content[0]}</div>
      <div className={styles.editContainer}>
        <EditPencil onClick={handleEditNode} className={styles.editButton} />
      </div>
    </li>
  )
}
