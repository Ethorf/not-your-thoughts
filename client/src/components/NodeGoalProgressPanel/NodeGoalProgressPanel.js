import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useIsMobile from '@hooks/useIsMobile'
import NodeGoalStats from '@components/NodeGoalStats/NodeGoalStats'
import { CogIcon } from '@components/Shared/CogIcon/CogIcon'
import { saveNodeEntry } from '@redux/reducers/currentEntryReducer'
import { SAVE_TYPES } from '@constants/saveTypes'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

import styles from './NodeGoalProgressPanel.module.scss'

const NodeGoalProgressPanel = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

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
        className={styles.arrowContainer}
        onClick={() => setPanelOpen((open) => !open)}
        aria-expanded={panelOpen}
        aria-label="Toggle current stats"
        data-tooltip-id="main-tooltip"
        data-tooltip-content="current stats"
        data-tooltip-place="left"
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
