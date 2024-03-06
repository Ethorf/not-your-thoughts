import React from 'react'
import { EditPencil } from '../Shared/EditPencil/EditPencil'
import { useHistory } from 'react-router-dom'

import styles from './NodeEntry.module.scss'

export const NodeEntry = ({ node: { id, title, content, category } }) => {
  const history = useHistory()

  const handleEditNode = () => {
    history.push(`/create-node-entry?entryId=${id}`)
  }
  console.log('category is:')
  console.log(category)
  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Title: {title}</div>
      <div className={styles.nodeValue}>Category: {category ?? 'n/a'}</div>
      <div className={styles.nodeValue}>Content: {content[0]}</div>
      <EditPencil onClick={handleEditNode} className={styles.editButton} />
    </li>
  )
}
