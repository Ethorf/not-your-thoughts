import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTimeElapsed } from '../../redux/reducers/journalEntriesReducer.js'
import styles from './Timer.module.scss'

const Timer = () => {
  const dispatch = useDispatch()
  const { timeElapsed: reduxTimeElapsed } = useSelector((state) => state.journalEntries)
  const { wordCount } = useSelector((state) => state.currentEntry)

  useEffect(() => {
    let timer
    // Update the time elapsed in Redux every second when wordCount is greater than 0
    if (wordCount > 0) {
      timer = setInterval(() => {
        dispatch(setTimeElapsed(reduxTimeElapsed + 1))
      }, 1000)
    }
    // Cleanup timer on unmount
    return () => clearInterval(timer)
  }, [dispatch, reduxTimeElapsed, wordCount])

  // Function to format time in m:ss format
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return <div className={styles.wrapper}>{formatTime(reduxTimeElapsed)}</div>
}

export default Timer
