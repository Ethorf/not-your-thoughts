import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

import { showToast } from '@utils/toast'
import { normalizeEntryId } from '@utils/normalizeEntryId'
import { ENTRY_TYPES } from '@constants/entryTypes'
import {
  resetCurrentEntryState,
  createNodeEntry,
  createJournalEntry,
  autosaveCurrentEntryIfNeeded,
} from '@redux/reducers/currentEntryReducer'

// Styles
import styles from './Dashboard.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import { NodesDashboardList } from '@components/Shared/NodesDashboardList/NodesDashboardList'
import { JournalsDashboardList } from '@components/Shared/JournalsDashboardList/JournalsDashboardList'
import useIsMobile from '@hooks/useIsMobile'

const { NODE, JOURNAL } = ENTRY_TYPES

const Dashboard = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const [activeEntryType, setActiveEntryType] = useState(NODE)

  const handleNewNodeEntryClick = async () => {
    await dispatch(autosaveCurrentEntryIfNeeded())
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
    await dispatch(autosaveCurrentEntryIfNeeded())
    // Do not reset — createJournalEntry resumes today's journal if it already exists.
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
      <h1 className={styles.dashboardTitle}>Dashboard</h1>
      <div className={styles.actionsContainer}>
        <div className={styles.entryTypeToggle}>
          <h2>{isMobile ? 'Show:' : null}</h2>

          <DefaultButton isSelected={activeEntryType === NODE} onClick={() => setActiveEntryType(NODE)}>
            Nodes
          </DefaultButton>
          <DefaultButton isSelected={activeEntryType === JOURNAL} onClick={() => setActiveEntryType(JOURNAL)}>
            Journals
          </DefaultButton>
        </div>
        {activeEntryType === NODE && !isMobile && (
          <DefaultButton
            className={styles.globalViewButton}
            onClick={() => history.push('/explore?view=global')}
            tooltip="View global mind map"
          >
            Global View
          </DefaultButton>
        )}
        <div className={classNames(styles.newEntry)}>
          <h2>{isMobile ? 'New:' : 'New Entry:'}</h2>
          <DefaultButton onClick={handleNewNodeEntryClick}>Node</DefaultButton>
          <DefaultButton onClick={handleNewJournalEntryClick}>Journal</DefaultButton>
        </div>
      </div>
      {activeEntryType === NODE ? <NodesDashboardList /> : <JournalsDashboardList />}
    </div>
  )
}

export default Dashboard
