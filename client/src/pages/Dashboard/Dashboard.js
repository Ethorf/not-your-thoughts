import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

// Redux
import { resetCurrentEntryState, createNodeEntry, createJournalEntry } from '@redux/reducers/currentEntryReducer'

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
    const newNode = await dispatch(createNodeEntry())

    history.push(`/edit-node-entry?entryId=${newNode.payload}`)
  }

  const handleNewJournalEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newJournal = await dispatch(createJournalEntry())

    return history.push(`/create-journal-entry?entryId=${newJournal.payload}`)
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Dashboard</h1>
      <div className={classNames(styles.newEntry)}>
        <h2>New Entry:</h2>
        <DefaultButton onClick={handleNewNodeEntryClick}>Node</DefaultButton>
        <DefaultButton onClick={handleNewJournalEntryClick}>Journal</DefaultButton>
      </div>

      <div className={styles.customPromptsList}>
        <NodesDashboardList />
      </div>
    </div>
  )
}

export default Dashboard
