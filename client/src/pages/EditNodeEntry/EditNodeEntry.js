import React, { useEffect, useMemo, useCallback } from 'react'
import classNames from 'classnames'
import { useLocation, useHistory } from 'react-router-dom'
import { unwrapResult } from '@reduxjs/toolkit'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { setTitle, saveNodeEntry, setEntryById, updateNodeTopLevel } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'
import { fetchConnections, getSelectedText } from '@redux/reducers/connectionsReducer'

// Constants
import { SAVE_TYPES } from '@constants/saveTypes'
import { MODAL_NAMES } from '@constants/modalNames.js'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'
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

import styles from './EditNodeEntry.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

const { PRIMARY } = CONNECTION_ENTRY_SOURCES

const EditNodeEntry = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const { connectionsLoading } = useSelector((state) => state.connections)
  const { wordCount, entryId, title, starred, isTopLevel, entriesLoading } = useSelector((state) => state.currentEntry)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const entryIdParam = params.get('entryId')
    if (entryIdParam !== undefined) {
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

  const handleToggleTopLevel = useCallback(() => {
    if (entryId) {
      dispatch(updateNodeTopLevel({ entryId, isTopLevel: !isTopLevel }))
    }
  }, [dispatch, entryId, isTopLevel])

  const handleSaveNode = useCallback(
    (saveType) => {
      dispatch(saveNodeEntry({ saveType }))
    },
    [dispatch]
  )

  const handleOpenConnectionsWithSelectedText = useCallback(async () => {
    const handleOpenConnectionsModal = async () => {
      try {
        const fetchConnRes = await dispatch(fetchConnections(entryId))
        unwrapResult(fetchConnRes)
        dispatch(openModal(MODAL_NAMES.CONNECTIONS))
      } catch (error) {
        console.error('Failed to fetch connections:', error)
      }
    }

    try {
      const getSelectedTextRes = await dispatch(getSelectedText(PRIMARY))
      unwrapResult(getSelectedTextRes)
      await handleOpenConnectionsModal()
    } catch (error) {
      console.error('Get selected text failure', error)
    }
  }, [dispatch, entryId])

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
      <div className={styles.editContainer}>
        <div className={classNames(styles.topContainer, styles.grid3Columns)}>
          {/* {content || title ? ( */}
          <>
            <div className={styles.connectStarContainer}>
              <DefaultButton
                tooltip="Open connections menu"
                onClick={handleOpenConnectionsWithSelectedText}
                className={styles.saveButton}
              >
                Connect
              </DefaultButton>
              <DefaultButton
                tooltip={isTopLevel ? 'Remove top-level status' : 'Set as top-level node'}
                onClick={handleToggleTopLevel}
                className={classNames(styles.saveButton, {
                  [styles.topLevelActive]: isTopLevel,
                })}
              >
                {isTopLevel ? 'Top Level ✓' : 'Top Level'}
              </DefaultButton>
              <StarButton id={entryId} initialStarred={starred} />
            </div>
            <DefaultInput
              className={classNames(styles.titleInput, sharedStyles.flexCenter, {
                [styles.titleInputNoBorder]: title.length,
              })}
              placeholder={'Enter Title'}
              value={title}
              onChange={handleTitleChange}
            />
            <span className={sharedStyles.flexSpaceBetween}>
              <AkasDisplay />
              <DefaultButton
                tooltip="Explore nodes"
                onClick={() => history.push(`/explore`)}
                className={styles.saveButton}
              >
                Explore
              </DefaultButton>
            </span>
          </>
        </div>
        {!connectionsLoading ? (
          <div className={styles.connectionLinesWrapper}>
            <ConnectionLines entryId={entryId} />
            <CreateEntry entryType={ENTRY_TYPES.NODE} />
          </div>
        ) : null}
        <div className={styles.grid3Columns}>
          <span className={sharedStyles.flexStart}>
            <DefaultButton
              tooltip="View entry history and changes"
              onClick={() => history.push('/history')}
              className={styles.saveButton}
            >
              History
            </DefaultButton>
          </span>
          <span className={sharedStyles.flexCenter}>Words: {wordCount}</span>
          <span className={sharedStyles.flexEnd}>
            {entriesLoading ? (
              <SmallSpinner />
            ) : (
              <DefaultButton onClick={() => handleSaveNode(SAVE_TYPES.MANUAL)} className={styles.saveButton}>
                Save Node
              </DefaultButton>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default EditNodeEntry
