import React from 'react'
import { useHistory } from 'react-router-dom'

import styles from './Dashboard.module.scss'
import sharedStyles from '../../styles/shared.module.scss'
import classNames from 'classnames'

import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'
import { CustomPromptsList } from '../../components/Shared/CustomPromptsList/CustomPromptsList'
import CustomPromptsSection from '../../components/CustomPromptsSection/CustomPromptsSection.js'

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
      <div className={classNames(styles.newEntry)}>
        <h2>New Entry:</h2>
        <DefaultButton onClick={handleNewNodeEntryClick}>Node</DefaultButton>
        <DefaultButton onClick={handleNewJournalEntryClick}>Journal</DefaultButton>
      </div>
      <CustomPromptsSection />
      <div className={styles.customPromptsList}>
        <CustomPromptsList />
      </div>
    </div>
  )
}

export default Dashboard
