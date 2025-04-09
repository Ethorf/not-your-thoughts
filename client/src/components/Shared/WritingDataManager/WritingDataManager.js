import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createWritingData, setTimeElapsed, setWordsAdded } from '@redux/reducers/writingDataReducer'

const WritingDataManager = ({ showDisplay = false, entryType, handleAutosave }) => {
  const dispatch = useDispatch()

  const [activeWordCount, setActiveWordCount] = useState(null)
  const [shouldAutosave, setShouldAutosave] = useState(false)

  const timeoutRef = useRef(null)
  const autosaveTimeoutRef = useRef(null)
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
      setActiveWordCount(wordCountRef.current)

      intervalRef.current = setInterval(() => {
        const newTime = timeElapsedRef.current + 1
        timeElapsedRef.current = newTime
        dispatch(setTimeElapsed(newTime))
      }, 1000)
    }

    // Cancel any pending autosave since user is actively typing
    clearTimeout(autosaveTimeoutRef.current)
    setShouldAutosave(false)
  }, [dispatch])

  const stopTimer = useCallback(
    async (autosave = false) => {
      console.log('TIMER STOPPED')
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

      if (autosave) {
        setShouldAutosave(true)
      }
    },
    [dispatch, entryType]
  )

  useEffect(() => {
    if (entriesSaving) {
      stopTimer()
    }
  }, [entriesSaving, stopTimer])

  useEffect(() => {
    if (entryId !== entryIdRef.current) {
      stopTimer(true) // Stop timer & mark for autosave
      entryIdRef.current = entryId
    }
  }, [entryId, stopTimer])

  useEffect(() => {
    const handleKeyPress = () => {
      startTimer()

      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        stopTimer(true) // Stop & mark for autosave if idle for 5 sec
      }, 5000)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      stopTimer(true)
      clearTimeout(timeoutRef.current)
    }
  }, [startTimer, stopTimer])

  // Autosave if idle for 10 seconds
  useEffect(() => {
    if (shouldAutosave) {
      autosaveTimeoutRef.current = setTimeout(() => {
        console.log('Triggering Autosave...')
        handleAutosave()
        setShouldAutosave(false)
      }, 10000) // Autosave after 10 seconds of inactivity
    }
    return () => clearTimeout(autosaveTimeoutRef.current)
  }, [shouldAutosave, handleAutosave])

  // Detect tab switch or page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab switched! Triggering autosave...')
        stopTimer(true) // Stop and mark for autosave
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [stopTimer])

  // Autosave before navigating away from the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopTimer(true) // Stop & mark for autosave before navigating away
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [stopTimer])

  return showDisplay ? (
    <div>
      <h1>Writing Timer</h1>
      <p>Time Elapsed: {timeElapsed} seconds</p>
      <p>Total Word Count at Last Save: {activeWordCount !== null ? activeWordCount : 'N/A'}</p>
      <p>Words Added: {wordsAdded}</p>
    </div>
  ) : null
}

export default WritingDataManager
