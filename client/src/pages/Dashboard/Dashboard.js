import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

import { resetCurrentEntryState } from '@redux/reducers/currentEntryReducer'

// Styles
import styles from './Dashboard.module.scss'
import sharedStyles from '@styles/shared.module.scss'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import { NodesDashboardList } from '@components/Shared/NodesDashboardList/NodesDashboardList'

const Dashboard = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const handleNewNodeEntryClick = () => {
    dispatch(resetCurrentEntryState())
    return history.push('/create-node-entry')
  }

  const handleNewJournalEntryClick = () => {
    dispatch(resetCurrentEntryState())
    return history.push('/create-journal-entry')
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Dashboard</h1>
      <div className={classNames(styles.newEntry)}>
        <h2>New Entry:</h2>
        <DefaultButton onClick={handleNewNodeEntryClick}>Node</DefaultButton>
        <DefaultButton onClick={handleNewJournalEntryClick}>Journal</DefaultButton>
      </div>
      <h3>Nodes</h3>
      <div className={styles.customPromptsList}>
        <NodesDashboardList />
      </div>
    </div>
  )
}

export default Dashboard
