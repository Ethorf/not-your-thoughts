import React from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import StarButton from '@components/Shared/StarButton/StarButton'
import NodeGoalStats from '@components/NodeGoalStats/NodeGoalStats'

// Redux
import { toggleEntryIsPrivate } from '@redux/reducers/currentEntryReducer'
import { openModal, closeModal } from '@redux/reducers/modalsReducer'

import styles from './NodeSettingsModal.module.scss'

export const NodeSettingsModal = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { entryId, isPrivate, starred } = useSelector((state) => state.currentEntry)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const handleToggleIsPrivate = () => {
    if (entryId) {
      dispatch(toggleEntryIsPrivate({ entryId }))
    }
  }

  const handleNavigate = (path) => {
    dispatch(closeModal())
    history.push(path)
  }

  const handleOpenDeleteConfirm = () => {
    dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.NODE_SETTINGS}>
      <div className={styles.wrapper}>
        <div className={styles.buttonsSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>Node Settings</h2>
            <StarButton id={entryId} initialStarred={starred} />
          </div>

          <div className={styles.buttons}>
            <DefaultButton
              className={classNames(styles.settingsButton, { [styles.active]: isPrivate })}
              onClick={handleToggleIsPrivate}
            >
              {isPrivate ? 'Private ✓' : 'Private'}
            </DefaultButton>
            {isAuthenticated && user?.id && (
              <DefaultButton
                className={styles.settingsButton}
                onClick={() => handleNavigate(`/show-node-entry?userId=${user.id}&entryId=${entryId}`)}
              >
                Public Mode
              </DefaultButton>
            )}
            <DefaultButton className={styles.settingsButton} onClick={() => handleNavigate('/history')}>
              History
            </DefaultButton>
            <DefaultButton className={styles.settingsButton} onClick={() => handleNavigate('/explore')}>
              Explore
            </DefaultButton>
            <DefaultButton
              className={classNames(styles.settingsButton, styles.deleteButton)}
              onClick={handleOpenDeleteConfirm}
            >
              Delete
            </DefaultButton>
          </div>
        </div>

        <div className={styles.statsSection}>
          <h3 className={styles.sectionHeading}>Today&apos;s Goals</h3>
          <NodeGoalStats />
        </div>
      </div>
    </BaseModalWrapper>
  )
}
