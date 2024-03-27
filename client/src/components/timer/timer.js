import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTimeElapsed } from '../../redux/reducers/currentEntryReducer.js'

import { formatTime } from '../../utils/formatTime.js'

import styles from './Timer.module.scss'

const Timer = () => {
  const dispatch = useDispatch()
  const { timeElapsed: reduxTimeElapsed } = useSelector((state) => state.currentEntry)
  const { wordCount } = useSelector((state) => state.currentEntry)
  const timerActive = wordCount > 0

  useEffect(() => {
    let timer

    if (timerActive) {
      timer = setInterval(() => {
        dispatch(setTimeElapsed(reduxTimeElapsed + 1))
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [timerActive, dispatch, reduxTimeElapsed])

  return <div className={styles.wrapper}>{formatTime(reduxTimeElapsed)}</div>
}

export default Timer
