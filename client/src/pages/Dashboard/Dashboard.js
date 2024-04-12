import React from 'react'
import { useHistory } from 'react-router-dom'

import styles from './Dashboard.module.scss'
import sharedStyles from '../../styles/shared.module.scss'
import classNames from 'classnames'

import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'

const Dashboard = () => {
  const history = useHistory()

  const handleNewNodeEntryClick = () => {
    return history.push('/create-node-entry')
  }

  const handleNewJournalEntryClick = () => {
    return history.push('/create-journal-entry')
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Dashboard</h1>
      <h3 className={classNames(sharedStyles.title)}>New Entry:</h3>
      <div>
        <DefaultButton onClick={handleNewNodeEntryClick}>Node</DefaultButton>
        <DefaultButton onClick={handleNewJournalEntryClick}>Journal</DefaultButton>
      </div>
      <h3>Prompts</h3>
    </div>
  )
}

export default Dashboard
