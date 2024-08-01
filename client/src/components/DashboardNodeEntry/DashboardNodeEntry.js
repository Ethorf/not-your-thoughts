import React from 'react'
import { useDispatch } from 'react-redux'

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

export const DashboardNodeEntry = ({ node: { id, starred, title, pending, date_last_modified, num_of_words } }) => {
  const dispatch = useDispatch()

  const handleOpenAreYouSureModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
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
      <div className={styles.pending}>{pending ? 'Pending' : num_of_words}</div>
      <DefaultButton className={styles.deleteButton} onClick={handleOpenAreYouSureModal}>
        Delete
      </DefaultButton>
    </li>
  )
}
