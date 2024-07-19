import React from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import TextButton from '@components/Shared/TextButton/TextButton'

import styles from './EditNodeLink.module.scss'

const EditNodeLink = ({ className, node }) => {
  const history = useHistory()
  const { id, title } = node

  const handleEditNode = () => {
    history.push(`/edit-node-entry?entryId=${id}`)
  }

  const TITLE_ELIPSIS_SPLIT = 17
  const longerThanElipsis = title.length > TITLE_ELIPSIS_SPLIT

  return (
    <TextButton
      tooltip={longerThanElipsis ? `edit: ${title}` : 'edit'}
      className={classNames(styles.titleButton, className)}
      onClick={handleEditNode}
    >
      {title.split('').splice(0, TITLE_ELIPSIS_SPLIT)}
      {longerThanElipsis && '...'}
    </TextButton>
  )
}

export default EditNodeLink
