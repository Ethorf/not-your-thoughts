import React, { useEffect, useState } from 'react'
import moment from 'moment'
// import TimerDisplay from './TimerDisplay' // Import TimerDisplay if needed
import { useSelector } from 'react-redux' // Import useSelector if needed
import styles from './JournalInfoContainer.module.scss' // Import your CSS module

const JournalInfoContainer = () => {
  const guestMode = useSelector((state) => state.auth.guestMode)
  const journalConfig = useSelector((state) => state.entries.journalConfig)
  const charCount = useSelector((state) => state.wordCount.charCount)
  const timeElapsed = useSelector((state) => state.entries.timeElapsed)
  const wordCount = useSelector((state) => state.currentEntry.wordCount)

  const [wpmCalc, setWpmCalc] = useState(Math.trunc((charCount / 5 / timeElapsed) * 60))
  const [wpmCounter, setWpmCounter] = useState(0)

  // TODO fix WPM this shit broken
  useEffect(() => {
    // setWpmCalc((timeElapsed / 2) % 5 === 0 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : wpmCalc)
    let wpmInterval = null

    wpmInterval = setInterval(() => {
      setWpmCounter(wpmCalc)
    }, 2000)

    return () => clearInterval(wpmInterval)
  }, [charCount, timeElapsed, wpmCalc, wpmCounter])

  //   TODO probably can add journalConfig check or fetch here
  //   But will just wanna make it into toolkit pattern since this shit is annoying right now

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.date}>{moment().format('MM/DD/YYYY')}</h3>
      {/* <span
        className={'main__timer-display'}
        style={guestMode || user.timerEnabled ? { opacity: 1 } : { opacity: 0 }}
      >
        <TimerDisplay />
      </span> */}
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
      {/* <h3
        className={`main__wpm-text-container`}
        style={guestMode || (journalConfig.wpm_enabled && window.innerWidth > 767) ? { opacity: 1 } : { opacity: 0 }}
      >
        {charCount >= 20 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : 'N/A'}
        WPM
      </h3> */}
      <h3 className={styles.wordCount}>{wordCount} Words</h3>
    </div>
  )
}

export default JournalInfoContainer
