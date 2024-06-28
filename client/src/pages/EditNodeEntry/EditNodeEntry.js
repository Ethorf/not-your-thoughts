import React, { useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { useLocation, useHistory } from 'react-router-dom'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { setTitle, updateNodeEntry, setEntryById, resetCurrentEntryState } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Constants
import { SAVE_TYPES } from '@constants/saveTypes'
import { MODAL_NAMES } from '@constants/modalNames.js'

// Components
import CreateEntry from '@components/Shared/CreateEntry/CreateEntry'
import AkasDisplay from '@components/Shared/AkasDisplay/AkasDisplay'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import TextButton from '@components/Shared/TextButton/TextButton'
import DefaultInput from '@components/Shared/DefaultInput/DefaultInput'
import AutosaveTimer from '@components/Shared/AutosaveTimer/AutosaveTimer'
import Spinner from '@components/Shared/Spinner/Spinner'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'

import styles from './EditNodeEntry.module.scss'

const EditNodeEntry = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()
  const { wordCount, entryId, content, title, entriesLoading } = useSelector((state) => state.currentEntry)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const entryIdParam = params.get('entryId')
    if (entryIdParam) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, params])

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleSaveNode = (saveType) => {
    dispatch(updateNodeEntry({ entryId, content, title, saveType }))
  }

  const handleNewNode = () => {
    dispatch(resetCurrentEntryState())
    history.push('/create-node-entry')
  }

  const handleOpenConnectionsModal = () => {
    dispatch(openModal(MODAL_NAMES.CONNECTIONS))
  }

  return (
    <div className={styles.wrapper}>
      <AutosaveTimer handleAutosave={() => handleSaveNode(SAVE_TYPES.AUTO)} />
      <div className={styles.editContainer}>
        <h2>Edit Node</h2>
        <div className={classNames(styles.topContainer, styles.grid4ColumnsCustom)}>
          {content || title ? (
            <>
              <TextButton onClick={handleOpenConnectionsModal}>Connections</TextButton>
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
        <CreateEntry />
        <div className={styles.grid3Columns}>
          <span className={styles.flexStart}>Words: {wordCount}</span>
          <span className={styles.flexCenter}>
            <DefaultButton onClick={() => handleNewNode()} className={styles.saveButton}>
              New Node
            </DefaultButton>
          </span>
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
