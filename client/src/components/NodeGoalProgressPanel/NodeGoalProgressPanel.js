import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useIsMobile from '@hooks/useIsMobile'
import NodeGoalStats from '@components/NodeGoalStats/NodeGoalStats'
import { CogIcon } from '@components/Shared/CogIcon/CogIcon'
import { autosaveCurrentEntryIfNeeded } from '@redux/reducers/currentEntryReducer'
import { buildNodeGoalStatuses } from '@utils/buildNodeGoalStatuses'
import { getGoalProgressPercent } from '@utils/getGoalProgressPercent'
import { ENTRY_TYPES } from '@constants/entryTypes'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

import styles from './NodeGoalProgressPanel.module.scss'

/** Pie wedge from 12 o'clock, clockwise. 50 fills a half circle. */
const getProgressPiePath = (percent) => {
  const clamped = Math.max(0, Math.min(100, percent))
  if (clamped <= 0) {
    return ''
  }

  const cx = 6
  const cy = 6
  const radius = 5.2

  if (clamped >= 100) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
  }

  const angle = (clamped / 100) * Math.PI * 2
  const x = cx + radius * Math.sin(angle)
  const y = cy - radius * Math.cos(angle)
  const largeArc = clamped > 50 ? 1 : 0

  return `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} Z`
}

const GoalStatusDot = ({ complete, progress, label }) => {
  const piePath = complete ? '' : getProgressPiePath(progress)

  return (
    <span
      className={classNames(styles.statusDot, {
        [styles.statusDotComplete]: complete,
      })}
      aria-label={complete ? `${label}: complete` : `${label}: ${progress}%`}
    >
      {complete ? (
        <svg className={styles.statusCheck} viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 6.2l2.4 2.4 4.6-5.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        piePath && (
          <svg className={styles.statusPie} viewBox="0 0 12 12" aria-hidden="true">
            <path d={piePath} />
          </svg>
        )
      )}
    </span>
  )
}

const NodeGoalProgressPanel = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  const { journalConfig } = useSelector((state) => state.journalEntries)
  const { wordCount, type: entryType } = useSelector((state) => state.currentEntry)
  const {
    stats: { nodesWordCountToday, nodesWritingTimeToday, journalWordCountToday, journalWritingTimeToday },
    wordsAdded,
    timeElapsed,
    sessionActive,
  } = useSelector((state) => state.writingData)

  const goalStatuses = buildNodeGoalStatuses({
    journalConfig,
    wordCount,
    nodesWordCountToday,
    nodesWritingTimeToday,
    journalWordCountToday,
    journalWritingTimeToday,
    wordsAdded,
    timeElapsed,
    sessionActive,
    entryType: entryType || ENTRY_TYPES.NODE,
  })

  const handleGoToProfile = useCallback(async () => {
    await dispatch(autosaveCurrentEntryIfNeeded())
    history.push('/profile')
  }, [dispatch, history])

  if (isMobile) {
    return null
  }

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.panelOpen]: panelOpen,
      })}
    >
      <button
        type="button"
        className={styles.toggleHandle}
        onClick={() => setPanelOpen((open) => !open)}
        aria-expanded={panelOpen}
        aria-label="Toggle goals"
        data-tooltip-id="main-tooltip"
        data-tooltip-content="goals"
        data-tooltip-place="left"
      >
        <img
          className={classNames(styles.arrow, panelOpen ? styles.arrowExpanded : styles.arrowCollapsed)}
          src={arrow}
          alt=""
        />
        {!panelOpen && goalStatuses.length > 0 && (
          <span className={styles.collapsedIndicators} aria-hidden="true">
            {goalStatuses.map((goal) => (
              <GoalStatusDot
                key={goal.id}
                complete={goal.complete}
                progress={getGoalProgressPercent(goal.current, goal.goal)}
                label={`${goal.label}: ${goal.current}/${goal.goal} ${goal.unit}`}
              />
            ))}
          </span>
        )}
      </button>
      <aside
        className={classNames(styles.panel, {
          [styles.panelOpen]: panelOpen,
        })}
        aria-label="Daily goal progress"
      >
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Today&apos;s Goals</h3>
          <button
            type="button"
            className={styles.settingsCog}
            onClick={handleGoToProfile}
            data-tooltip-id="main-tooltip"
            data-tooltip-content="Profile settings"
            data-tooltip-place="left"
            aria-label="Go to profile settings"
          >
            <CogIcon className={styles.cogIcon} />
          </button>
        </div>
        <NodeGoalStats />
      </aside>
    </div>
  )
}

export default NodeGoalProgressPanel
