import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useIsMobile from '@hooks/useIsMobile'
import NodeGoalStats from '@components/NodeGoalStats/NodeGoalStats'
import { CogIcon } from '@components/Shared/CogIcon/CogIcon'
import { saveNodeEntry } from '@redux/reducers/currentEntryReducer'
import { SAVE_TYPES } from '@constants/saveTypes'
import { buildNodeGoalStatuses } from '@utils/buildNodeGoalStatuses'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

import styles from './NodeGoalProgressPanel.module.scss'

const GoalStatusDot = ({ complete, label }) => (
  <span
    className={classNames(styles.statusDot, {
      [styles.statusDotComplete]: complete,
    })}
    aria-label={complete ? `${label}: complete` : `${label}: incomplete`}
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
    ) : null}
  </span>
)

const NodeGoalProgressPanel = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  const { journalConfig } = useSelector((state) => state.journalEntries)
  const { wordCount } = useSelector((state) => state.currentEntry)
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
  })

  const handleGoToProfile = useCallback(async () => {
    await dispatch(saveNodeEntry({ saveType: SAVE_TYPES.AUTO }))
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
        aria-label="Node daily goal progress"
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
