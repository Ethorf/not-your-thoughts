import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createWritingData, setTimeElapsed, setWordsAdded } from '@redux/reducers/writingDataReducer'

const WritingDataTimer = ({ showDisplay = false, entryType }) => {
  const dispatch = useDispatch()

  const [activeWordCount, setActiveWordCount] = useState(null)

  const timeoutRef = useRef(null)
  const intervalRef = useRef(null)
  const wordCountRef = useRef(0)
  const timeElapsedRef = useRef(0)
  const entryIdRef = useRef(null)

  const { wordCount, entryId, entriesSaving } = useSelector((state) => state.currentEntry)
  const { timeElapsed, wordsAdded } = useSelector((state) => state.writingData)

  useEffect(() => {
    wordCountRef.current = wordCount
    const wordsAdded = activeWordCount !== null ? wordCountRef.current - activeWordCount : 0

    dispatch(setWordsAdded(wordsAdded))
  }, [activeWordCount, dispatch, wordCount])

  const startTimer = useCallback(() => {
    if (intervalRef.current === null) {
      console.log('<><><><><><><><timer started')
      setActiveWordCount(wordCountRef.current)

      intervalRef.current = setInterval(() => {
        const newTime = timeElapsedRef.current + 1

        timeElapsedRef.current = newTime

        dispatch(setTimeElapsed(newTime))
      }, 1000)
    }
  }, [dispatch])

  const stopTimer = useCallback(async () => {
    console.log('TIMER STOPPED BIIIIITCH')
    console.log('<<<<<< entryType >>>>>>>>> is: <<<<<<<<<<<<')
    console.log(entryType)
    if (intervalRef.current !== null && entryIdRef.current !== null) {
      const {
        meta: { requestStatus },
      } = await dispatch(createWritingData({ entryType }))
      console.log(requestStatus)

      clearInterval(intervalRef.current)
      intervalRef.current = null

      dispatch(setTimeElapsed(0))
      timeElapsedRef.current = 0
      setActiveWordCount(null)
    }
  }, [dispatch]) // `dispatch` is the only dependency since refs don't trigger re-renders

  useEffect(() => {
    if (entriesSaving === true) {
      stopTimer()
    }
  }, [entriesSaving, stopTimer])

  useEffect(() => {
    entryIdRef.current = entryId
    stopTimer()
  }, [entryId, stopTimer])

  useEffect(() => {
    // This is basically setting a timeout so that we can create writing data when a key hasn't been pressed for 5 seconds
    const handleKeyPress = () => {
      startTimer()

      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        stopTimer()
      }, 5000)
    }
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      stopTimer()

      clearTimeout(timeoutRef.current)
    }
  }, [startTimer, stopTimer])

  return showDisplay ? (
    <div>
      <h1>Writing Timer</h1>
      <p>Time Elapsed: {timeElapsed} seconds</p>
      <p>total Word count at last writing data save: {activeWordCount !== null ? activeWordCount : 'N/A'}</p>
      <p>Words Added: {wordsAdded}</p>
    </div>
  ) : null
}

export default WritingDataTimer
