import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import TextButton from '@components/Shared/TextButton/TextButton'
import NodeSelectDropdown from '@components/Shared/NodeSelectDropdown/NodeSelectDropdown'
import DefaultDropdown from '@components/Shared/DefaultDropdown/DefaultDropdown'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'

// Redux
import {
  createConnection,
  fetchConnections,
  deleteConnection,
  setConnectionTitleInput,
  setSelectedPrimarySourceText,
  setSelectedForeignSourceText,
} from '@redux/reducers/connectionsReducer'
import { createNodeEntry } from '@redux/reducers/currentEntryReducer'

import styles from './ConnectionsModal.module.scss'

const { DIRECT, SINGLE_WORD, DESCRIPTION } = CONNECTION_SOURCE_TYPES
const { HORIZONTAL, VERTICAL } = CONNECTION_TYPES
const { PRIMARY, FOREIGN } = CONNECTION_ENTRY_SOURCES

export const ConnectionsModal = () => {
  const dispatch = useDispatch()
  const [localForeignEntryId, setLocalForeignEntryId] = useState(null)
  const [localConnectionType, setLocalConnectionType] = useState(HORIZONTAL)
  const [localConnectionSourceType, setLocalConnectionSourceType] = useState(DIRECT)

  const [newNodeTitle, setNewNodeTitle] = useState('')

  const { entryId, title } = useSelector((state) => state.currentEntry)
  const {
    selectedPrimarySourceText,
    selectedForeignSourceText,
    connections,
    connectionsLoading,
    connectionTitleInput,
  } = useSelector((state) => state.connections)
  const { content } = useSelector((state) => state.currentEntry)

  useEffect(() => {
    dispatch(fetchConnections(entryId))
  }, [dispatch, entryId])

  const handleCreateConnection = async () => {
    if (localForeignEntryId) {
      await dispatch(createConnection({ primary_entry_id: entryId, foreign_entry_id: localForeignEntryId }))
      await dispatch(setConnectionTitleInput(''))
    } else {
      const newNode = await dispatch(createNodeEntry({ title: newNodeTitle }))
      const newForeignEntryId = newNode?.payload?.id ?? null

      await dispatch(
        createConnection({ type: localConnectionType, primary_entry_id: entryId, foreign_entry_id: newForeignEntryId })
      )
      setLocalForeignEntryId(newForeignEntryId)
      await dispatch(setConnectionTitleInput(''))
    }
  }

  const handleDeleteConnection = async (id) => {
    dispatch(deleteConnection(id))
  }

  const getSelectedText = (entry_source) => {
    if (window.getSelection) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const container = document.createElement('div')
        container.appendChild(range.cloneContents())
        if (entry_source === PRIMARY) {
          dispatch(setSelectedPrimarySourceText(container.innerHTML))
        } else if (entry_source === FOREIGN) {
          dispatch(setSelectedForeignSourceText(container.innerHTML))
        }
      }
    }
  }

  const highlightMatchingText = (content, match) => {
    if (!match) return content
    const regex = new RegExp(`(${match})`, 'gi')
    return content.replace(regex, '<span class="highlight">$1</span>')
  }

  const highlightedContent = highlightMatchingText(content, selectedPrimarySourceText)

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.CONNECTIONS} className={styles.overflowVisible}>
      <div className={styles.wrapper}>
        <h2>{title}</h2>
        <NodeSelectDropdown
          onChange={(value) => setNewNodeTitle(value)}
          onSelect={(value) => setLocalForeignEntryId(value)}
          setInputValue={(e) => dispatch(setConnectionTitleInput(e))}
          inputValue={connectionTitleInput}
        />
        <div className={styles.flexContainer}>
          <p>Select Connection Source Type:</p>
          <DefaultDropdown
            className={styles.createDropdown}
            value={localConnectionSourceType}
            options={Object.values(CONNECTION_SOURCE_TYPES)}
            onChange={(e) => setLocalConnectionSourceType(e.target.value)}
            tooltip={'Change connection source type'}
          />
        </div>
        <div className={styles.sourceSelectionContainer}>
          {localConnectionSourceType === DIRECT ? (
            <>
              <div className={styles.entrySourceContainer}>
                <h4 className={styles.entrySourceHeader}>Primary Entry Source</h4>
                <TextButton className={styles.getSourceButton} onClick={() => getSelectedText(PRIMARY)}>
                  Select Source Text
                </TextButton>
                <div className={styles.entrySource} dangerouslySetInnerHTML={{ __html: highlightedContent }} />
              </div>
              {localForeignEntryId ? (
                <div>
                  <h4>Foreign Entry Source</h4>
                  <div>foreign entry content</div>
                </div>
              ) : null}
            </>
          ) : null}
          {localConnectionSourceType === DESCRIPTION ? (
            <div>
              <h4>Enter source description...</h4>
              <textarea />
            </div>
          ) : null}
        </div>
        <div className={styles.createContainer}>
          <DefaultButton onClick={handleCreateConnection}>Create connection</DefaultButton>
          <div className={styles.flexContainer}>
            <p>Type:</p>
            <DefaultDropdown
              className={styles.createDropdown}
              value={localConnectionType}
              options={Object.values(CONNECTION_TYPES)}
              onChange={(e) => setLocalConnectionType(e.target.value)}
              tooltip={'Change connection type'}
            />
          </div>
        </div>
        {connectionsLoading ? (
          <SmallSpinner />
        ) : (
          <div>
            {connections?.length ? (
              <div>
                <h3>Active Connections:</h3>
                {connections.map((c) => (
                  <div className={styles.connectionDisplay}>
                    <div className={styles.connectionLabel}>node:</div>
                    <div className={styles.connectionText}>{c.foreign_entry_title}</div>
                    <div className={styles.connectionLabel}>type:</div>
                    <div className={styles.connectionText}>{c.type}</div>
                    <DefaultButton onClick={() => handleDeleteConnection(c.id)}>X</DefaultButton>
                  </div>
                ))}
              </div>
            ) : (
              'No connections yet...'
            )}
          </div>
        )}
      </div>
    </BaseModalWrapper>
  )
}
