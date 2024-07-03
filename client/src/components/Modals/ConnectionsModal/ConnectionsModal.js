import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'
import { CONNECTION_TYPES, VERTICAL_CONNECTION_TYPES } from '@constants/connectionTypes'
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import TextButton from '@components/Shared/TextButton/TextButton'
import NodeSelectDropdown from '@components/Shared/NodeSelectDropdown/NodeSelectDropdown'
import DefaultDropdown from '@components/Shared/DefaultDropdown/DefaultDropdown'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import HorizontalDivider from '@components/Shared/HorizontalDivider/HorizontalDivider'

// Redux
import {
  createConnection,
  fetchConnections,
  deleteConnection,
  setConnectionTitleInput,
  setSelectedPrimarySourceText,
  setSelectedForeignSourceText,
} from '@redux/reducers/connectionsReducer'
import { createNodeEntry, fetchEntryById } from '@redux/reducers/currentEntryReducer'

import styles from './ConnectionsModal.module.scss'

const { DIRECT, SINGLE_WORD, DESCRIPTIVE } = CONNECTION_SOURCE_TYPES
const { HORIZONTAL, VERTICAL } = CONNECTION_TYPES
const { PRIMARY, FOREIGN } = CONNECTION_ENTRY_SOURCES

export const ConnectionsModal = () => {
  const dispatch = useDispatch()
  const [localForeignEntryId, setLocalForeignEntryId] = useState(null)
  const [localForeignEntryContent, setLocalForeignEntryContent] = useState(null)
  const [localConnectionType, setLocalConnectionType] = useState(HORIZONTAL)
  const [localConnectionSourceType, setLocalConnectionSourceType] = useState(DIRECT)
  const [connectionDescription, setConnectionDescription] = useState('')
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

  useEffect(() => {
    const fetchForeignEntry = async () => {
      if (localForeignEntryId) {
        const fetchedForeignEntry = await dispatch(fetchEntryById(localForeignEntryId))
        setLocalForeignEntryContent(fetchedForeignEntry.payload.content[0])
      }
    }
    fetchForeignEntry()
  }, [dispatch, localForeignEntryId])

  const handleCreateDirectConnection = async () => {
    // TODO see if I can abstract this shit out to the reducer without being redundant
    // ?? How much local state do I really need and why
    await dispatch(
      createConnection({
        connection_type: localConnectionType,
        primary_entry_id: entryId,
        foreign_entry_id: localForeignEntryId,
        primary_source: selectedPrimarySourceText,
        foreign_source: selectedForeignSourceText,
        source_type: localConnectionSourceType,
      })
    )
    await dispatch(setConnectionTitleInput(''))
  }

  const handleCreatDescriptionConnection = async () => {
    await dispatch(
      createConnection({
        connection_type: localConnectionType,
        primary_entry_id: entryId,
        foreign_entry_id: localForeignEntryId,
        primary_source: connectionDescription,
        source_type: localConnectionSourceType,
      })
    )
    await dispatch(setConnectionTitleInput(''))
  }

  const handleCreateConnection = async () => {
    if (localForeignEntryId) {
      await handleCreateDirectConnection()
    } else {
      const newNode = await dispatch(createNodeEntry({ title: newNodeTitle }))
      const newForeignEntryId = newNode?.payload?.id ?? null

      if (localConnectionSourceType === DIRECT) {
        await handleCreateDirectConnection()
      } else if (localConnectionSourceType === DESCRIPTIVE) {
        await handleCreatDescriptionConnection()
      }
      setLocalForeignEntryId(newForeignEntryId)
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
    return content?.replace(regex, '<span class="highlight">$1</span>')
  }

  const highlightedPrimaryContent = highlightMatchingText(content, selectedPrimarySourceText)
  const highlightedForeignContent = highlightMatchingText(localForeignEntryContent, selectedForeignSourceText)

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
        <HorizontalDivider className={styles.horizontalDivider} />
        <div className={styles.sourceSelectionContainer}>
          {localConnectionSourceType === DIRECT ? (
            <>
              <div className={styles.entrySourceContainer}>
                <h4 className={styles.entrySourceHeader}>Primary Entry Source</h4>
                <TextButton className={styles.getSourceButton} onClick={() => getSelectedText(PRIMARY)}>
                  Select Primary Source Text
                </TextButton>
                <div className={styles.entrySource} dangerouslySetInnerHTML={{ __html: highlightedPrimaryContent }} />
              </div>
              {localForeignEntryId ? (
                <div className={styles.entrySourceContainer}>
                  <h4 className={styles.entrySourceHeader}>Foreign Entry Source</h4>
                  <TextButton
                    className={styles.getSourceButton}
                    onClick={() => getSelectedText(FOREIGN)}
                    tooltip="cruckky"
                  >
                    Select Foreign Source Text
                  </TextButton>
                  <div className={styles.entrySource} dangerouslySetInnerHTML={{ __html: highlightedForeignContent }} />
                </div>
              ) : null}
            </>
          ) : null}
          {localConnectionSourceType === DESCRIPTIVE ? (
            <div>
              <h4>Enter connection description...</h4>
              <textarea
                className={styles.connectionDescriptionTextarea}
                value={connectionDescription}
                onChange={(e) => setConnectionDescription(e.target.value)}
              />
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
            {localConnectionType === VERTICAL && (
              <DefaultDropdown
                className={styles.createDropdown}
                value={localConnectionType}
                options={Object.values(VERTICAL_CONNECTION_TYPES)}
                onChange={(e) => setLocalConnectionType(e.target.value)}
                tooltip={'Change vertical connection type'}
              />
            )}
          </div>
        </div>
        <HorizontalDivider className={styles.horizontalDivider} />
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
                    <div className={styles.connectionText}>{c.connection_type}</div>
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
