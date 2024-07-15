import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

// Components
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner.js'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import TextButton from '@components/Shared/TextButton/TextButton'
import { FavStarIcon } from '@components/Shared/FavStarIcon/FavStarIcon'

// Redux
import { setEntryById, toggleNodeStarred } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '@constants/modalNames.js'

import styles from './DashboardNodeEntry.module.scss'

export const DashboardNodeEntry = ({ node: { id, starred, title, content } }) => {
  const [localLoading, setLocalLoading] = useState(false)
  const [isStarred, setIsStarred] = useState(starred)

  const history = useHistory()
  const dispatch = useDispatch()

  const handleEditNode = () => {
    history.push(`/edit-node-entry?entryId=${id}`)
  }

  const handleOpenAreYouSureModal = async () => {
    setLocalLoading(true)
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
    setLocalLoading(false)
  }
  const handleToggleNodeStarred = () => {
    setIsStarred(() => !isStarred)
    dispatch(toggleNodeStarred(id))
  }

  return (
    <li className={styles.wrapper} key={id}>
      <FavStarIcon
        onClick={handleToggleNodeStarred}
        starred={starred}
        className={classNames(styles.favStarIcon, { [styles.starred]: isStarred })}
      />
      <TextButton tooltip="edit node" className={styles.titleButton} onClick={handleEditNode}>
        {title}
      </TextButton>
      <DefaultButton onClick={handleOpenAreYouSureModal}>Delete</DefaultButton>
    </li>
  )
}
