import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer'
import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'
import { buildNodeGoalStatuses } from '@utils/buildNodeGoalStatuses'
import { getGoalProgressPercent } from '@utils/getGoalProgressPercent'
import { toNonNegativeInt } from '@utils/writingStatsHelpers'

import styles from './NodeGoalStats.module.scss'

const SECTION_TITLES = {
  thisNode: 'This Node',
  nodesToday: 'Nodes Today',
  journals: 'Journals',
}

const groupGoalsBySection = (goals) => {
  const sections = []

  goals.forEach((goal) => {
    const lastSection = sections[sections.length - 1]
    if (!lastSection || lastSection.id !== goal.section) {
      sections.push({ id: goal.section, goals: [goal] })
      return
    }
    lastSection.goals.push(goal)
  })

  return sections
}

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
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const { wordCount } = useSelector((state) => state.currentEntry)
  const {
    stats: { nodesWordCountToday, nodesWritingTimeToday, journalWordCountToday, journalWritingTimeToday },
    wordsAdded,
    timeElapsed,
    sessionActive,
  } = useSelector((state) => state.writingData)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    dispatch(fetchJournalConfig())
    dispatch(fetchAllWritingData())
  }, [dispatch, isAuthenticated])

  const goals = buildNodeGoalStatuses({
    journalConfig,
    wordCount,
    nodesWordCountToday,
    nodesWritingTimeToday,
    journalWordCountToday,
    journalWritingTimeToday,
    wordsAdded,
    timeElapsed,
    sessionActive,
  })

  if (!journalConfig || goals.length === 0) {
    return null
  }

  const sections = groupGoalsBySection(goals)

  return (
    <div className={styles.stats}>
      {sections.map((section) => (
        <React.Fragment key={section.id}>
          <h4 className={styles.sectionTitle}>{SECTION_TITLES[section.id]}</h4>
          {section.goals.map((goal) => (
            <GoalMeter
              key={goal.id}
              label={goal.label}
              current={goal.current}
              goal={goal.goal}
              unit={goal.unit}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

export default NodeGoalStats
