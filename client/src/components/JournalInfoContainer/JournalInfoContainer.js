import React from 'react'
import moment from 'moment'
import TimerComponent from '../TimerComponent/TimerComponent.js'
import WPMDisplay from '../WPMDisplay/WPMDisplay.js'

import { useSelector } from 'react-redux' // Import useSelector if needed
import styles from './JournalInfoContainer.module.scss' // Import your CSS module

const JournalInfoContainer = () => {
  const guestMode = useSelector((state) => state.auth.guestMode)
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const { wordCount } = useSelector((state) => state.currentEntry)

  //   TODO add useJournalConfig hook here etc

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.date}>{moment().format('MM/DD/YYYY')}</h3>
      <TimerComponent />
      {guestMode ? (
        <h2 className={styles.goal}>Goal: 200 words</h2>
      ) : (
        <h2 className={styles.goal}>
          Goal:{' '}
          {journalConfig.goal_preference === 'words'
            ? `${journalConfig.daily_words_goal} Words`
            : `${journalConfig.daily_time_goal} Minute${journalConfig.daily_time_goal >= 2 ? 's' : ''}`}
        </h2>
      )}
      <WPMDisplay />
      <h3 className={styles.wordCount}>{wordCount} Words</h3>
    </div>
  )
}

export default JournalInfoContainer
