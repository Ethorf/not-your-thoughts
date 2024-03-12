import React from 'react'
import { useHistory } from 'react-router-dom'

import styles from './EntryTypeSwitcher.module.scss'
import sharedStyles from '../../styles/shared.module.scss'
import classNames from 'classnames'

import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'

const EntryTypeSwitcher = () => {
  const history = useHistory()

  const handleNodeEntryClick = () => {
    return history.push('/create-node-entry')
  }

  const handleJournalEntryClick = () => {
    return history.push('/create-journal-entry')
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h2 className={classNames(sharedStyles.title)}>Choose Entry Type:</h2>
      <div>
        <DefaultButton onClick={handleNodeEntryClick}>Node</DefaultButton>
        <DefaultButton onClick={handleJournalEntryClick}>Journal</DefaultButton>
      </div>
    </div>
  )
}

export default EntryTypeSwitcher
