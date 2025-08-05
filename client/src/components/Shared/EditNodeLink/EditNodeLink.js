import React from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import TextButton from '@components/Shared/TextButton/TextButton'

import styles from './EditNodeLink.module.scss'

const EditNodeLink = ({ className, node, onClick }) => {
  const history = useHistory()
  const { id, title } = node

  const handleEditNode = () => {
    history.push(`/edit-node-entry?entryId=${id}`)
    onClick && onClick()
  }

  const TITLE_ELIPSIS_SPLIT = 17
  const longerThanElipsis = title?.length > TITLE_ELIPSIS_SPLIT

  return (
    <TextButton
      tooltip={longerThanElipsis ? `edit: ${title}` : 'edit'}
      className={classNames(styles.titleButton, styles.ellipsisify, className)}
      onClick={handleEditNode}
    >
      {title}
    </TextButton>
  )
}

export default EditNodeLink
