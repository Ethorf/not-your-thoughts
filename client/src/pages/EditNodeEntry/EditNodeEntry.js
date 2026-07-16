import React, { useEffect, useMemo, useCallback } from 'react'
import classNames from 'classnames'
import { useLocation, useHistory } from 'react-router-dom'
import { unwrapResult } from '@reduxjs/toolkit'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  setTitle,
  saveNodeEntry,
  setEntryById,
  toggleEntryIsPrivate,
} from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'
import { fetchConnections } from '@redux/reducers/connectionsReducer'
import { setPendingEditorSelectionForModal } from '@utils/captureEditorSelection'
import { normalizeEntryId } from '@utils/normalizeEntryId'

// Constants
import { SAVE_TYPES } from '@constants/saveTypes'
import { MODAL_NAMES } from '@constants/modalNames.js'
import { ENTRY_TYPES } from '@constants/entryTypes'

// Components
import CreateEntry from '@components/Shared/CreateEntry/CreateEntry'
import AkasDisplay from '@components/Shared/AkasDisplay/AkasDisplay'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import StarButton from '@components/Shared/StarButton/StarButton'
import DefaultInput from '@components/Shared/DefaultInput/DefaultInput'
import WritingDataManager from '@components/Shared/WritingDataManager/WritingDataManager'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import ConnectionLines from '@components/Shared/ConnectionLines/ConnectionLines'
import NodeGoalProgressPanel from '@components/NodeGoalProgressPanel/NodeGoalProgressPanel'
import { CogIcon } from '@components/Shared/CogIcon/CogIcon'
import useIsMobile from '@hooks/useIsMobile'

import styles from './EditNodeEntry.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

const EditNodeEntry = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const { connectionsLoading } = useSelector((state) => state.connections)
  const { wordCount, entryId, title, starred, isPrivate, entriesLoading } = useSelector(
    (state) => state.currentEntry
  )
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const isMobile = useIsMobile()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const entryIdParam = normalizeEntryId(params.get('entryId'))
    if (entryIdParam != null) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, params])

  useEffect(() => {
    if (entryId) {
      dispatch(fetchConnections(entryId))
    }
  }, [dispatch, entryId])

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleToggleIsPrivate = useCallback(() => {
    if (entryId) {
      dispatch(toggleEntryIsPrivate({ entryId }))
    }
  }, [dispatch, entryId])

  const handleSaveNode = useCallback(
    (saveType) => {
      dispatch(saveNodeEntry({ saveType }))
    },
    [dispatch]
  )

  const captureEditorSelectionForModal = useCallback(() => {
    setPendingEditorSelectionForModal()
  }, [])

  const handleOpenConnectionsModal = useCallback(async () => {
    try {
      const fetchConnRes = await dispatch(fetchConnections(entryId))
      unwrapResult(fetchConnRes)
      dispatch(openModal(MODAL_NAMES.CONNECTIONS))
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    }
  }, [dispatch, entryId])

  const handleOpenConnectionsWithSelectedText = useCallback(async () => {
    captureEditorSelectionForModal()
    await handleOpenConnectionsModal()
  }, [captureEditorSelectionForModal, handleOpenConnectionsModal])

  const handleOpenDeleteConfirm = useCallback(() => {
    dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }, [dispatch])

  useEffect(() => {
    const handleShortcuts = async (e) => {
      if (e.ctrlKey && e.metaKey && e.key === 'c') {
        await handleOpenConnectionsWithSelectedText()
      }
      if (e.metaKey && e.shiftKey && e.key === 's') {
        console.log('Save Shortcut heet')
        await handleSaveNode(SAVE_TYPES.MANUAL)
      }
    }

    window.addEventListener('keydown', handleShortcuts)
    return () => {
      window.removeEventListener('keydown', handleShortcuts)
    }
  }, [handleOpenConnectionsWithSelectedText, handleSaveNode])

  return (
    <div className={styles.wrapper}>
      <WritingDataManager entryType={ENTRY_TYPES.NODE} handleAutosave={() => handleSaveNode(SAVE_TYPES.AUTO)} />
      {!isMobile && <NodeGoalProgressPanel />}
      <div className={styles.editContainer}>
        <div className={classNames(styles.topContainer, styles.grid3Columns)}>
          <>
            {!isMobile && (
              <div className={styles.connectStarContainer}>
                <DefaultButton
                  tooltip="Open connections menu"
                  onMouseDown={captureEditorSelectionForModal}
                  onClick={handleOpenConnectionsModal}
                  className={styles.saveButton}
                >
                  Connect
                </DefaultButton>
                <DefaultButton
                  tooltip={isPrivate ? 'Make entry public' : 'Make entry private'}
                  onClick={handleToggleIsPrivate}
                  className={classNames({
                    [styles.topLevelActive]: isPrivate,
                  })}
                >
                  {isPrivate ? 'Private ✓' : 'Private'}
                </DefaultButton>
                <StarButton id={entryId} initialStarred={starred} />
              </div>
            )}
            <div className={styles.titleInputContainer}>
              {isMobile && (
                <button
                  type="button"
                  className={styles.settingsCog}
                  onClick={() => dispatch(openModal(MODAL_NAMES.NODE_SETTINGS))}
                  data-tooltip-id="main-tooltip"
                  data-tooltip-content="Node settings"
                  aria-label="Open node settings"
                >
                  <CogIcon className={styles.cogIcon} />
                </button>
              )}
              <DefaultInput
                className={classNames(styles.titleInput, sharedStyles.flexCenter, {
                  [styles.titleInputNoBorder]: (title ?? '').length,
                })}
                placeholder={'Enter Title'}
                value={title ?? ''}
                onChange={handleTitleChange}
                autoComplete="off"
                autoCorrect="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
              />
              {isMobile && (
                <span className={styles.mobileAkas}>
                  <AkasDisplay />
                </span>
              )}
            </div>
            {!isMobile && (
              <span className={styles.topRightContainer}>
                <AkasDisplay />
                <div className={styles.rightButtons}>
                  {isAuthenticated && user?.id && (
                    <DefaultButton
                      tooltip="View public mode"
                      onClick={() => history.push(`/show-node-entry?userId=${user.id}&entryId=${entryId}`)}
                      className={styles.saveButton}
                    >
                      Public Mode
                    </DefaultButton>
                  )}
                  <DefaultButton
                    tooltip="Explore nodes"
                    onClick={() => history.push(`/explore`)}
                    className={styles.saveButton}
                  >
                    Explore
                  </DefaultButton>
                </div>
              </span>
            )}
          </>
        </div>
        {!connectionsLoading ? (
          <div className={styles.connectionLinesWrapper}>
            {!isMobile && <ConnectionLines entryId={entryId} />}
            <CreateEntry entryType={ENTRY_TYPES.NODE} fillHeight />
          </div>
        ) : null}
        <div className={classNames(styles.grid3Columns, styles.bottomBar)}>
          <span className={classNames(sharedStyles.flexStart, styles.historyCell, styles.wordsCell)}>
            {!isMobile && (
              <span className={styles.leftActions}>
                <DefaultButton
                  tooltip="View entry history and changes"
                  onClick={() => history.push('/history')}
                  className={styles.saveButton}
                >
                  History
                </DefaultButton>
                <DefaultButton tooltip="Delete node" className={styles.deleteButton} onClick={handleOpenDeleteConfirm}>
                  X
                </DefaultButton>
              </span>
            )}
            {isMobile && <span className={styles.wordCount}>Words: {wordCount}</span>}
          </span>
          {!isMobile && (
            <span className={classNames(sharedStyles.flexCenter, styles.wordsCell)}>Words: {wordCount}</span>
          )}
          <span className={classNames(sharedStyles.flexCenter, styles.saveCell)}>
            {entriesLoading ? (
              <SmallSpinner />
            ) : (
              <DefaultButton onClick={() => handleSaveNode(SAVE_TYPES.MANUAL)} className={styles.saveButton}>
                {isMobile ? 'Save' : 'Save Node'}
              </DefaultButton>
            )}
          </span>
          {isMobile && <span className={styles.bottomBarSpacer} aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}

export default EditNodeEntry
