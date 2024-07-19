import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import EditNodeLink from '@components/Shared/EditNodeLink/EditNodeLink'
import { FavStarIcon } from '@components/Shared/FavStarIcon/FavStarIcon'

// Utils
import { parseDate } from '@utils/parseDate'

// Redux
import { setEntryById, toggleNodeStarred } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '@constants/modalNames.js'

import styles from './DashboardNodeEntry.module.scss'

export const DashboardNodeEntry = ({ node: { id, starred, title, pending, date_last_modified } }) => {
  const [isStarred, setIsStarred] = useState(starred)

  const dispatch = useDispatch()

  const handleOpenAreYouSureModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }

  const handleToggleNodeStarred = () => {
    setIsStarred(() => !isStarred)
    dispatch(toggleNodeStarred({ entryId: id }))
  }

  return (
    <li className={styles.wrapper} key={id}>
      <FavStarIcon
        onClick={handleToggleNodeStarred}
        starred={isStarred}
        className={classNames(styles.favStarIcon, { [styles.starred]: isStarred })}
      />
      {!pending ? <div className={styles.date}>{parseDate(date_last_modified)}</div> : <div>Not yet...</div>}
      <EditNodeLink node={{ id, title }} />
      <div className={styles.pending}>{pending && 'Pending'}</div>
      <DefaultButton className={styles.deleteButton} onClick={handleOpenAreYouSureModal}>
        Delete
      </DefaultButton>
    </li>
  )
}
