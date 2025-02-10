import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'

import styles from './WritingDataDisplay.module.scss'

export const WritingDataDisplay = () => {
  const dispatch = useDispatch()
  const {
    stats: { allEntriesTotalWordCount, allEntriesTotalWritingTime, allEntriesWordCountToday },
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
        <p>All Entries Total Writing Time: {allEntriesTotalWritingTime}</p>
        <p>All Entries Words Written Today: {allEntriesWordCountToday}</p>
      </div>
    </div>
  )
}
