import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import useIsMobile from '@hooks/useIsMobile'
import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer'
import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'
import { getGoalProgressPercent } from '@utils/getGoalProgressPercent'
import { toNonNegativeInt } from '@utils/writingStatsHelpers'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

import styles from './NodeGoalProgressPanel.module.scss'

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
        <div
          className={styles.fill}
          style={{ width: `${progress}%` }}
          data-complete={isComplete || undefined}
        />
      </div>
      <span className={styles.percent}>{progress}%</span>
    </div>
  )
}

const NodeGoalProgressPanel = () => {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const {
    stats: { nodesWordCountToday, nodesWritingTimeToday },
    wordsAdded,
    timeElapsed,
    sessionActive,
  } = useSelector((state) => state.writingData)

  useEffect(() => {
    dispatch(fetchJournalConfig())
    dispatch(fetchAllWritingData())
  }, [dispatch])

  if (isMobile || !journalConfig) {
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

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.panelOpen]: panelOpen,
      })}
    >
      <button
        type="button"
        className={styles.arrowContainer}
        onClick={() => setPanelOpen((open) => !open)}
        aria-expanded={panelOpen}
        aria-label="Toggle current stats"
        data-tooltip-id="main-tooltip"
        data-tooltip-content="current stats"
      >
        <img
          className={classNames(styles.arrow, panelOpen ? styles.arrowExpanded : styles.arrowCollapsed)}
          src={arrow}
          alt=""
        />
      </button>
      <aside
        className={classNames(styles.panel, {
          [styles.panelOpen]: panelOpen,
        })}
        aria-label="Node daily goal progress"
      >
        <h3 className={styles.title}>Today&apos;s Goals</h3>
        <GoalMeter label="Words" current={currentWordsToday} goal={wordsGoal} unit="words" />
        <GoalMeter label="Time" current={currentTimeTodayMinutes} goal={timeGoalMinutes} unit="min" />
      </aside>
    </div>
  )
}

export default NodeGoalProgressPanel
