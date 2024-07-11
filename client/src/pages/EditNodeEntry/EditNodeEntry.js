import React, { useEffect, useMemo } from 'react'
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
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'
import { ENTRY_TYPES } from '@constants/entryTypes'

// Components
import CreateEntry from '@components/Shared/CreateEntry/CreateEntry'
import AkasDisplay from '@components/Shared/AkasDisplay/AkasDisplay'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import DefaultInput from '@components/Shared/DefaultInput/DefaultInput'
import AutosaveTimer from '@components/Shared/AutosaveTimer/AutosaveTimer'
import Spinner from '@components/Shared/Spinner/Spinner'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'

import styles from './EditNodeEntry.module.scss'

const {
  FRONTEND: { SIBLING, CHILD, PARENT },
} = CONNECTION_TYPES

const { PRIMARY, FOREIGN } = CONNECTION_ENTRY_SOURCES

const EditNodeEntry = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { wordCount, entryId, content, title, entriesLoading } = useSelector((state) => state.currentEntry)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const entryIdParam = params.get('entryId')
    if (entryIdParam) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, params])

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.ctrlKey && e.metaKey && e.key === 'c') {
        await handleOpenConnectionsWithSelectedText()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleSaveNode = (saveType) => {
    dispatch(updateNodeEntry({ entryId, content, title, saveType }))
  }

  const handleOpenConnectionsModal = async () => {
    try {
      const fetchConnRes = await dispatch(fetchConnections(entryId))
      unwrapResult(fetchConnRes)
      dispatch(openModal(MODAL_NAMES.CONNECTIONS))
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    }
  }

  const handleOpenConnectionsWithSelectedText = async () => {
    try {
      const getSelectedTextRes = await dispatch(getSelectedText(PRIMARY))
      unwrapResult(getSelectedTextRes)
      await handleOpenConnectionsModal()
    } catch (error) {
      console.error('Get selected text failure', error)
    }
  }

  return (
    <div className={styles.wrapper}>
      <AutosaveTimer handleAutosave={() => handleSaveNode(SAVE_TYPES.AUTO)} />
      <div className={styles.editContainer}>
        <h2>Edit Node</h2>
        <div className={classNames(styles.topContainer, styles.grid4ColumnsCustom)}>
          {content || title ? (
            <>
              <DefaultButton
                tooltip="Open connections menu"
                onClick={handleOpenConnectionsWithSelectedText}
                className={styles.saveButton}
              >
                Connect
              </DefaultButton>
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
        <CreateEntry type={ENTRY_TYPES.NODE} />
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
