import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import EditNodeLink from '@components/Shared/EditNodeLink/EditNodeLink'
import StarButton from '@components/Shared/StarButton/StarButton'

// Utils
import { parseDate } from '@utils/parseDate'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '@constants/modalNames.js'

// Styles
import styles from './DashboardNodeEntry.module.scss'

export const DashboardNodeEntry = ({ node = {} }) => {
  const { id = null, starred, title, pending, date_last_modified } = node
  const dispatch = useDispatch()
  const history = useHistory()

  const handleOpenAreYouSureModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }

  const handleExploreNode = async () => {
    await dispatch(setEntryById(id))
    history.push('/explore')
  }

  return (
    <li className={styles.wrapper} key={id}>
      <StarButton id={id} initialStarred={starred} />
      {!pending ? (
        <div data-tooltip-id="main-tooltip" data-tooltip-content="date modified" className={styles.date}>
          {parseDate(date_last_modified)}
        </div>
      ) : (
        <div>Not yet...</div>
      )}
      <EditNodeLink node={{ id, title }} />
      {pending && <div className={styles.pending}>{pending}</div>}
      <DefaultButton
        className={styles.exploreButton}
        onClick={handleExploreNode}
        tooltip="Explore this node's connections"
      >
        Explore
      </DefaultButton>
      <DefaultButton className={styles.deleteButton} onClick={handleOpenAreYouSureModal}>
        Delete
      </DefaultButton>
    </li>
  )
}
