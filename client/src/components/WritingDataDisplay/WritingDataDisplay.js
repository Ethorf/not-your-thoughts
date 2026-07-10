import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { formatTime } from '@utils/formatTime.js'
import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'
import { PROFILE_SETTINGS_TABS } from '@constants/profileSettingsTabs'

import styles from './WritingDataDisplay.module.scss'

export const WritingDataDisplay = ({ scope = PROFILE_SETTINGS_TABS.ALL }) => {
  const dispatch = useDispatch()
  const { stats } = useSelector((state) => state.writingData)
  const { journalConfig } = useSelector((state) => state.journalEntries)

  const {
    allEntriesTotalWordCount,
    allEntriesTotalWritingTime,
    allEntriesWordCountToday,
    allEntriesWritingTimeToday,
    nodesWritingTimeToday,
    nodesTotalWordCount,
    nodesTotalWritingTime,
    nodesWordCountToday,
    journalWritingTimeToday,
    journalsTotalWritingTime,
    journalsTotalWordCount,
    journalWordCountToday,
  } = stats

  useEffect(() => {
    dispatch(fetchAllWritingData())
  }, [dispatch])

  if (scope === PROFILE_SETTINGS_TABS.ALL) {
    return (
      <div className={styles.wrapper}>
        <p>Total Word Count: {allEntriesTotalWordCount}</p>
        <p>Total Writing Time: {formatTime(allEntriesTotalWritingTime)}</p>
        <p>Words Written Today: {allEntriesWordCountToday}</p>
        <p>Time Typed Today: {formatTime(allEntriesWritingTimeToday)}</p>
      </div>
    )
  }

  if (scope === PROFILE_SETTINGS_TABS.JOURNAL) {
    const wordsGoal = journalConfig?.daily_words_goal ?? 0
    const timeGoalMinutes = journalConfig?.daily_time_goal ?? 0
    const usesWordsGoal = journalConfig?.journal_goal_preference === 'words'

    return (
      <div className={styles.wrapper}>
        <p>Total Word Count: {journalsTotalWordCount}</p>
        <p>Total Writing Time: {formatTime(journalsTotalWritingTime)}</p>
        <p>Words Written Today: {journalWordCountToday}</p>
        <p>Time Typed Today: {formatTime(journalWritingTimeToday)}</p>
        {usesWordsGoal ? (
          <p className={styles.goalProgress}>
            Daily words progress: {journalWordCountToday} / {wordsGoal}
          </p>
        ) : (
          <p className={styles.goalProgress}>
            Daily time progress: {Math.floor(journalWritingTimeToday / 60)} / {timeGoalMinutes} minutes
          </p>
        )}
      </div>
    )
  }

  const nodeWordsGoal = journalConfig?.node_daily_words_goal ?? 400
  const nodeTimeGoalMinutes = journalConfig?.node_daily_time_goal ?? 5

  return (
    <div className={styles.wrapper}>
      <p>Total Word Count: {nodesTotalWordCount}</p>
      <p>Total Writing Time: {formatTime(nodesTotalWritingTime)}</p>
      <p>Words Written Today: {nodesWordCountToday}</p>
      <p>Time Typed Today: {formatTime(nodesWritingTimeToday)}</p>
      <p className={styles.goalProgress}>
        Daily words progress: {nodesWordCountToday} / {nodeWordsGoal}
      </p>
      <p className={styles.goalProgress}>
        Daily time progress: {Math.floor(nodesWritingTimeToday / 60)} / {nodeTimeGoalMinutes} minutes
      </p>
    </div>
  )
}
