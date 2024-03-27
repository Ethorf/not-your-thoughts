import React from 'react'
import { useSelector } from 'react-redux'

import styles from './WPMDisplay.module.scss'
const WPMDisplay = () => {
  const { timeElapsed } = useSelector((state) => state.journalEntries)
  const { wordCount } = useSelector((state) => state.currentEntry)

  // Calculate words per minute (WPM)
  const calculateWPM = () => {
    if (timeElapsed === 0 || wordCount === 0) {
      return 0
    }
    const minutesElapsed = timeElapsed / 60
    const wpm = wordCount / minutesElapsed
    return Math.round(wpm)
  }

  return <div className={styles.wrapper}>WPM: {calculateWPM()}</div>
}

export default WPMDisplay
