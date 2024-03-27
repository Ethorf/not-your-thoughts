import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setWPM } from '../../redux/reducers/currentEntryReducer.js'

import styles from './WPMDisplay.module.scss'

const WPMDisplay = () => {
  const dispatch = useDispatch()
  const { wordCount, timeElapsed } = useSelector((state) => state.currentEntry)

  // Calculate words per minute (WPM) with useCallback
  const calculateWPM = useCallback(() => {
    if (timeElapsed === 0 || wordCount === 0) {
      return 0
    }
    const minutesElapsed = timeElapsed / 60
    const wpm = wordCount / minutesElapsed
    return Math.round(wpm)
  }, [wordCount, timeElapsed])

  // Dispatch setWPM action when WPM changes
  useEffect(() => {
    const wpm = calculateWPM()
    dispatch(setWPM(wpm))
  }, [dispatch, timeElapsed, wordCount, calculateWPM])

  return (
    <div className={styles.wrapper}>
      <span>WPM:</span> {calculateWPM()}
    </div>
  )
}

export default WPMDisplay
