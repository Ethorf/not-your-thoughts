import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createWritingData, setTimeElapsed, setWordsAdded } from '@redux/reducers/writingDataReducer'

const WritingDataManager = ({ showDisplay = false, entryType, handleAutosave }) => {
  const dispatch = useDispatch()

  // state & refs
  const [activeWordCount, setActiveWordCount] = useState(null)
  const [shouldAutosave, setShouldAutosave] = useState(false)

  const timeoutRef = useRef(null)
  const autosaveTimeoutRef = useRef(null)
  const intervalRef = useRef(null)
  const wordCountRef = useRef(0)
  const timeElapsedRef = useRef(0)
  const entryIdRef = useRef(null)

  // store the latest timer callbacks here:
  const startTimerRef = useRef()
  const stopTimerRef = useRef()

  const { wordCount, entryId, entriesSaving } = useSelector((state) => state.currentEntry)
  const { timeElapsed, wordsAdded } = useSelector((state) => state.writingData)

  // update wordsAdded whenever wordCount changes
  useEffect(() => {
    wordCountRef.current = wordCount
    const added = activeWordCount !== null ? wordCountRef.current - activeWordCount : 0
    dispatch(setWordsAdded(added))
  }, [activeWordCount, dispatch, wordCount])

  // startTimer: once per mount
  const startTimer = useCallback(() => {
    if (intervalRef.current == null) {
      setActiveWordCount(wordCountRef.current)
      intervalRef.current = setInterval(() => {
        const t = timeElapsedRef.current + 1
        timeElapsedRef.current = t
        dispatch(setTimeElapsed(t))
      }, 1000)
    }
    clearTimeout(autosaveTimeoutRef.current)
    setShouldAutosave(false)
  }, [dispatch])

  // stopTimer: once per mount
  const stopTimer = useCallback(
    async (autosave = false) => {
      console.log('TIMER STOPPED')
      if (intervalRef.current != null && entryIdRef.current != null) {
        await dispatch(createWritingData({ entryType }))
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

  // keep refs up to date
  useEffect(() => {
    startTimerRef.current = startTimer
    stopTimerRef.current = stopTimer
  }, [startTimer, stopTimer])

  // keydown listener — only mounted/unmounted once
  useEffect(() => {
    const handleKeyPress = () => {
      startTimerRef.current()
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        stopTimerRef.current(true)
      }, 10000)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // autosave if idle
  useEffect(() => {
    if (shouldAutosave) {
      autosaveTimeoutRef.current = setTimeout(() => {
        console.log('Triggering Autosave…')
        handleAutosave()
        setShouldAutosave(false)
      }, 5000)
    }
    return () => clearTimeout(autosaveTimeoutRef.current)
  }, [shouldAutosave, handleAutosave])

  // on visibility change
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopTimerRef.current(true)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // before unload
  useEffect(() => {
    const onBefore = () => stopTimerRef.current(true)
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [])

  // stop timer when entry saves or ID changes
  useEffect(() => {
    if (entriesSaving) stopTimer()
  }, [entriesSaving, stopTimer])

  useEffect(() => {
    if (entryId !== entryIdRef.current) {
      stopTimer(true)
      entryIdRef.current = entryId
    }
  }, [entryId, stopTimer])

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
