import React, { useEffect, useMemo, useCallback } from 'react'
import classNames from 'classnames'
import { useLocation } from 'react-router-dom'
import { unwrapResult } from '@reduxjs/toolkit'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { setTitle, updateNodeEntry, setEntryById } from '@redux/reducers/currentEntryReducer'
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
import Spinner from '@components/Shared/Spinner/Spinner'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'

import styles from './EditNodeEntry.module.scss'

const { PRIMARY } = CONNECTION_ENTRY_SOURCES

const EditNodeEntry = () => {
  const dispatch = useDispatch()
  const location = useLocation()

  const { connectionsLoading } = useSelector((state) => state.connections)
  const { wordCount, entryId, content, title, starred, entriesLoading } = useSelector((state) => state.currentEntry)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const entryIdParam = params.get('entryId')
    if (entryIdParam) {
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

  const handleSaveNode = useCallback((saveType) => {
    dispatch(updateNodeEntry({ saveType }))
  })

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
        <h2>Edit Node</h2>
        <div className={classNames(styles.topContainer, styles.grid4ColumnsCustom)}>
          {content || title ? (
            <>
              <div className={styles.connectStarContainer}>
                <DefaultButton
                  tooltip="Open connections menu"
                  onClick={handleOpenConnectionsWithSelectedText}
                  className={styles.saveButton}
                >
                  Connect
                </DefaultButton>
                <StarButton id={entryId} initialStarred={starred} />
              </div>
              <DefaultInput
                className={classNames(styles.titleInput, styles.flexCenter, {
                  [styles.titleInputNoBorder]: title.length,
                })}
                placeholder={'Enter Title'}
                value={title}
                onChange={handleTitleChange}
              />
              <AkasDisplay />
            </>
          ) : (
            <Spinner />
          )}
        </div>
        {!connectionsLoading ? <CreateEntry entryType={ENTRY_TYPES.NODE} /> : null}
        <div className={styles.grid3Columns}>
          <span className={styles.flexStart}>Words: {wordCount}</span>
          <span />
          <span className={styles.flexEnd}>
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
