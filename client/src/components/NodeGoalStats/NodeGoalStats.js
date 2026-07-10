import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer'
import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'
import { getGoalProgressPercent } from '@utils/getGoalProgressPercent'
import { toNonNegativeInt } from '@utils/writingStatsHelpers'

import styles from './NodeGoalStats.module.scss'

const GoalMeter = ({ label, current, goal, unit }) => {
  const safeCurrent = toNonNegativeInt(current)
  const safeGoal = toNonNegativeInt(goal)
  const progress = getGoalProgressPercent(safeCurrent, safeGoal)
  const isComplete = safeGoal > 0 && safeCurrent >= safeGoal

  return (
    <div className={styles.meter}>
      <div className={styles.meterHeader}>
        <span className={styles.meterLabel}>{label}</span>
        <span className={styles.meterValue}>
          {safeCurrent} / {safeGoal} {unit}
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} data-complete={isComplete || undefined} />
      </div>
      <span className={styles.percent}>{progress}%</span>
    </div>
  )
}

const NodeGoalStats = () => {
  const dispatch = useDispatch()
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const {
    stats: { nodesWordCountToday, nodesWritingTimeToday, journalWordCountToday, journalWritingTimeToday },
    wordsAdded,
    timeElapsed,
    sessionActive,
  } = useSelector((state) => state.writingData)

  useEffect(() => {
    dispatch(fetchJournalConfig())
    dispatch(fetchAllWritingData())
  }, [dispatch])

  if (!journalConfig) {
    return null
  }

  const wordsGoal = toNonNegativeInt(journalConfig.node_daily_words_goal ?? 400)
  const timeGoalMinutes = toNonNegativeInt(journalConfig.node_daily_time_goal ?? 5)

  const savedWordsToday = toNonNegativeInt(nodesWordCountToday)
  const savedTimeTodaySeconds = toNonNegativeInt(nodesWritingTimeToday)
  const pendingWords = sessionActive ? toNonNegativeInt(wordsAdded) : 0
  const pendingTimeSeconds = sessionActive ? toNonNegativeInt(timeElapsed) : 0

  const currentWordsToday = savedWordsToday + pendingWords
  const currentTimeTodayMinutes = Math.floor((savedTimeTodaySeconds + pendingTimeSeconds) / 60)

  const journalUsesWordsGoal = journalConfig.journal_goal_preference !== 'time'
  const journalWordsGoal = toNonNegativeInt(journalConfig.daily_words_goal ?? 400)
  const journalTimeGoalMinutes = toNonNegativeInt(journalConfig.daily_time_goal ?? 5)
  const journalWordsToday = toNonNegativeInt(journalWordCountToday)
  const journalTimeTodayMinutes = Math.floor(toNonNegativeInt(journalWritingTimeToday) / 60)

  return (
    <div className={styles.stats}>
      <h4 className={styles.sectionTitle}>Nodes</h4>
      <GoalMeter label="Words" current={currentWordsToday} goal={wordsGoal} unit="words" />
      <GoalMeter label="Time" current={currentTimeTodayMinutes} goal={timeGoalMinutes} unit="min" />

      <h4 className={styles.sectionTitle}>Journals</h4>
      {journalUsesWordsGoal ? (
        <GoalMeter label="Words" current={journalWordsToday} goal={journalWordsGoal} unit="words" />
      ) : (
        <GoalMeter label="Time" current={journalTimeTodayMinutes} goal={journalTimeGoalMinutes} unit="min" />
      )}
    </div>
  )
}

export default NodeGoalStats
