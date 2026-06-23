import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

import { showToast } from '@utils/toast'
import { normalizeEntryId } from '@utils/normalizeEntryId'
import {
  resetCurrentEntryState,
  createNodeEntry,
  createJournalEntry,
} from '@redux/reducers/currentEntryReducer'

// Styles
import styles from './Dashboard.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import { NodesDashboardList } from '@components/Shared/NodesDashboardList/NodesDashboardList'

const Dashboard = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const handleNewNodeEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const result = await dispatch(createNodeEntry())

    if (createNodeEntry.rejected.match(result)) {
      showToast('Please log in to create a node', 'error')
      return
    }

    const newEntryId = normalizeEntryId(result.payload)
    if (newEntryId == null) {
      showToast('Failed to create node', 'error')
      return
    }

    history.push(`/edit-node-entry?entryId=${newEntryId}`)
  }

  const handleNewJournalEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const result = await dispatch(createJournalEntry())

    if (createJournalEntry.rejected.match(result)) {
      showToast('Please log in to create a journal entry', 'error')
      return
    }

    const newEntryId = normalizeEntryId(result.payload)
    if (newEntryId == null) {
      showToast('Failed to create journal entry', 'error')
      return
    }

    history.push(`/create-journal-entry?entryId=${newEntryId}`)
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Dashboard</h1>
      <div className={styles.actionsContainer}>
        <DefaultButton onClick={() => history.push('/explore?view=global')} tooltip="View global mind map">
          Global View
        </DefaultButton>
        <div className={classNames(styles.newEntry)}>
          <h2>New Entry:</h2>
          <DefaultButton onClick={handleNewNodeEntryClick}>Node</DefaultButton>
          <DefaultButton onClick={handleNewJournalEntryClick}>Journal</DefaultButton>
        </div>
      </div>
      <NodesDashboardList />
    </div>
  )
}

export default Dashboard
