import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { formatTime } from '@utils/formatTime.js'

import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'

import styles from './WritingDataDisplay.module.scss'

export const WritingDataDisplay = () => {
  const dispatch = useDispatch()
  const {
    stats: {
      allEntriesTotalWordCount,
      allEntriesTotalWritingTime,
      allEntriesWordCountToday,
      nodesWritingTimeToday,
      nodesTotalWordCount,
      nodesTotalWritingTime,
      journalWritingTimeToday,
      journalsTotalWritingTime,
      journalsTotalWordCount,
      journalWordCountToday,
    },
  } = useSelector((state) => state.writingData)

  useEffect(() => {
    dispatch(fetchAllWritingData())
  }, [dispatch])

  return (
    <div className={styles.wrapper}>
      <div className={styles.allEntriesContainer}>
        <h3 data-tooltip-id="main-tooltip" data-tooltip-content="Custom prompt" className={styles.prompt}>
          All Entries
        </h3>
        <p>All Entries Total Word Count: {allEntriesTotalWordCount}</p>
        <p>All Entries Total Writing Time: {formatTime(allEntriesTotalWritingTime)}</p>
        <p>All Entries Words Written Today: {allEntriesWordCountToday}</p>
        <h3 data-tooltip-id="main-tooltip" data-tooltip-content="Custom prompt" className={styles.prompt}>
          Nodes
        </h3>
        <p>Nodes Total Word Count: {nodesTotalWordCount}</p>
        <p>Nodes Total Writing Time: {formatTime(nodesTotalWritingTime)}</p>
        <p>Nodes Words Written Today: {formatTime(nodesWritingTimeToday)}</p>
        <h3 data-tooltip-id="main-tooltip" data-tooltip-content="Custom prompt" className={styles.prompt}>
          Journals
        </h3>
        <p>Journals Total Writing Time: {formatTime(journalsTotalWritingTime)}</p>
        <p>Journals Total Word Count: {journalsTotalWordCount}</p>
        <p>Journals Writing Time Today: {formatTime(journalWritingTimeToday)}</p>
        <p>Journals Word Count Today: {journalWordCountToday}</p>
      </div>
    </div>
  )
}
