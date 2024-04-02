import React from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { EditPencil } from '../Shared/EditPencil/EditPencil'

import { parseDate } from '../../utils/parseDate'

// Redux
import { setEntryById } from '../../redux/reducers/currentEntryReducer'
import { openModal } from '../../redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '../../constants/modalNames.js'

import styles from './NodeEntry.module.scss'

export const NodeEntry = ({ node: { id, date_last_modified, date_created, title, content, category_name } }) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const handleEditNode = () => {
    history.push(`/edit-node-entry?entryId=${id}`)
  }

  const handleOpenContentModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.NODE_CONTENT))
  }

  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Title: {title}</div>
      <div className={styles.nodeValue}>Modified: {parseDate(date_last_modified)}</div>
      <div className={styles.nodeValue}>Created: {parseDate(date_created)}</div>
      <div className={styles.nodeValue}>Category: {category_name ?? 'n/a'}</div>
      <div onClick={handleOpenContentModal} className={classNames(styles.nodeValue, styles.contentButton)}>
        Content: {content[0].slice(0, 15)}...
      </div>
      <div className={styles.editContainer}>
        <EditPencil onClick={handleEditNode} className={styles.editButton} />
      </div>
    </li>
  )
}
