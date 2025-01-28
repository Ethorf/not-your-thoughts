import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createWritingData, setTimeElapsed, setWordsAdded } from '@redux/reducers/writingDataReducer'

const WritingDataTimer = () => {
  const dispatch = useDispatch()

  const [activeWordCount, setActiveWordCount] = useState(null)

  const timeoutRef = useRef(null)
  const intervalRef = useRef(null)
  const wordCountRef = useRef(0)
  const timeElapsedRef = useRef(0)
  const entryIdRef = useRef(null)

  const { wordCount, entryId, entriesSaving } = useSelector((state) => state.currentEntry)
  const { timeElapsed, wordsAdded, stats } = useSelector((state) => state.writingData)

  useEffect(() => {
    wordCountRef.current = wordCount
    const wordsAdded = activeWordCount !== null ? wordCountRef.current - activeWordCount : 0
    dispatch(setWordsAdded(wordsAdded))
  }, [wordCount])

  useEffect(() => {
    entryIdRef.current = entryId
    stopTimer()
  }, [entryId])

  useEffect(() => {
    if (entriesSaving === true) {
      stopTimer()
    }
  }, [entriesSaving])

  const startTimer = () => {
    if (intervalRef.current === null) {
      console.log('timer started')
      setActiveWordCount(wordCountRef.current)

      intervalRef.current = setInterval(() => {
        const newTime = timeElapsedRef.current + 1

        timeElapsedRef.current = newTime

        dispatch(setTimeElapsed(newTime))
      }, 1000)
    }
  }

  const stopTimer = async () => {
    if (intervalRef.current !== null && entryIdRef.current !== null) {
      const {
        meta: { requestStatus },
      } = await dispatch(createWritingData())

      console.log(requestStatus)
      clearInterval(intervalRef.current)
      intervalRef.current = null

      dispatch(setTimeElapsed(0))
      timeElapsedRef.current = 0
      setActiveWordCount(null)
    }
  }

  const handleKeyPress = () => {
    startTimer()

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      stopTimer()
    }, 5000)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      stopTimer()

      clearTimeout(timeoutRef.current)
    }
  }, [])

  // TODO we can probably removed the time-elapsed ref once we don't actually need to display anything w/ this component
  return (
    <div>
      <h1>Writing Timer</h1>
      <p>Time Elapsed: {timeElapsed} seconds</p>
      <p>Active word count: {activeWordCount !== null ? activeWordCount : 'N/A'}</p>
      <p>Words Added: {wordsAdded}</p>
    </div>
  )
}

export default WritingDataTimer
