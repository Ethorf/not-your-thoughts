import React from 'react'
import { useDispatch } from 'react-redux'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'

import EditNodeLink from '@components/Shared/EditNodeLink/EditNodeLink'
import StarButton from '@components/Shared/StarButton/StarButton'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '@constants/modalNames.js'

// Styles
import styles from './SidebarNode.module.scss'

export const SidebarNode = ({ node: { id, starred, title } }) => {
  const dispatch = useDispatch()

  const handleOpenAreYouSureModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }

  return (
    <li className={styles.wrapper} key={id}>
      <StarButton id={id} initialStarred={starred} />
      <EditNodeLink node={{ id, title }} />
      <TextButton tooltip="delete node" className={styles.deleteButton} onClick={handleOpenAreYouSureModal}>
        x
      </TextButton>
    </li>
  )
}
