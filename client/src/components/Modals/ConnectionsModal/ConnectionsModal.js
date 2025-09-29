import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { SAVE_TYPES } from '@constants/saveTypes'
import { MODAL_NAMES } from '@constants/modalNames'
import { CONNECTION_TYPES, FRONT_TO_BACK_CONN_TYPES } from '@constants/connectionTypes'
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'
import { HORIZONTAL_DIVIDER_HEIGHTS } from '@constants/horizontalDividerHeights'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import NodeSelectDropdown from '@components/Shared/NodeSelectDropdown/NodeSelectDropdown'
import DefaultDropdown from '@components/Shared/DefaultDropdown/DefaultDropdown'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import HorizontalDivider from '@components/Shared/HorizontalDivider/HorizontalDivider'
import EditNodeLink from '@components/Shared/EditNodeLink/EditNodeLink'

// Redux
import {
  createConnection,
  deleteConnection,
  setConnectionTitleInput,
  setConnectionSourceType,
  getSelectedText,
  updateConnection,
} from '@redux/reducers/connectionsReducer'
import { createNodeEntry, fetchEntryById, saveNodeEntry } from '@redux/reducers/currentEntryReducer'
import { closeModal } from '@redux/reducers/modalsReducer.js'

// Utils
import { highlightMatchingText } from '@utils/highlightMatchingText'
import { showToast } from '@utils/toast'
import { isValidUrl } from '@utils/isValidUrl'
import { wrapLinkStringInAnchorTag } from '@utils/wrapLinkStringInAnchorTag'

// Styles
import styles from './ConnectionsModal.module.scss'

// Constant Destructures
const { DIRECT, DESCRIPTIVE, SINGLE_WORD } = CONNECTION_SOURCE_TYPES
const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const { PRIMARY, FOREIGN } = CONNECTION_ENTRY_SOURCES

const { SMALL } = HORIZONTAL_DIVIDER_HEIGHTS

export const ConnectionsModal = () => {
  const dispatch = useDispatch()
  const {
    connections,
    connectionsLoading,
    connectionTitleInput,
    connectionSourceType,
    modalConnectionType,
    selectedPrimarySourceText,
    selectedForeignSourceText,
  } = useSelector((state) => state.connections)
  const { content, entryId, title, isTopLevel } = useSelector((state) => state.currentEntry)

  const [localForeignEntryId, setLocalForeignEntryId] = useState(null)
  const [localForeignEntryContent, setLocalForeignEntryContent] = useState(null)
  const [localConnectionType, setLocalConnectionType] = useState(modalConnectionType)
  const [connectionDescription, setConnectionDescription] = useState('')
  const [externalLinkInput, setExternalLinkInput] = useState(null)
  const [newNodeTitle, setNewNodeTitle] = useState('')

  // Reset all local state values on load

  const resetLocalState = async () => {
    await dispatch(setConnectionTitleInput(''))
    setLocalForeignEntryId(null)
    setExternalLinkInput(null)
    setConnectionDescription('')
  }

  // Reset connection type if it's PARENT and node is top-level
  useEffect(() => {
    if (isTopLevel && localConnectionType === PARENT) {
      setLocalConnectionType(SIBLING) // Default to sibling if parent is not available
    }
  }, [isTopLevel, localConnectionType])

  const handleModalOpen = async () => {
    await resetLocalState()
  }

  useEffect(() => {
    const fetchForeignEntry = async () => {
      if (localForeignEntryId) {
        const fetchedForeignEntry = await dispatch(fetchEntryById(localForeignEntryId))
        setLocalForeignEntryContent(fetchedForeignEntry?.payload?.content[0])
      }
    }
    fetchForeignEntry()
  }, [dispatch, localForeignEntryId])

  const onCreateConnection = async () => {
    await dispatch(
      createConnection({
        connection_type: localConnectionType,
        current_entry_id: entryId,
        primary_entry_id: localConnectionType === PARENT ? localForeignEntryId : entryId,
        foreign_entry_id: localConnectionType === PARENT ? entryId : localForeignEntryId,
        primary_source: connectionSourceType === DESCRIPTIVE ? connectionDescription : selectedPrimarySourceText,
        foreign_source: connectionSourceType === DIRECT ? selectedForeignSourceText : null,
        source_type: connectionSourceType,
      })
    )
    await resetLocalState()
  }

  const handleUpdateNodeWithLink = async (content, linkString, link) => {
    await dispatch(
      saveNodeEntry({
        entryId,
        content: wrapLinkStringInAnchorTag(content, linkString, link),
        title,
        saveType: SAVE_TYPES.EXTERNAL_CONNECTION,
      })
    )
  }

  const onCreateExternalConnection = async () => {
    if (!isValidUrl(externalLinkInput)) {
      showToast('Please enter a valid external link', 'error')
      return
    }

    await dispatch(
      createConnection({
        connection_type: localConnectionType,
        current_entry_id: entryId,
        primary_entry_id: entryId,
        foreign_entry_id: null,
        primary_source: selectedPrimarySourceText,
        foreign_source: externalLinkInput,
        source_type: DIRECT,
      })
    )

    if (selectedPrimarySourceText) await handleUpdateNodeWithLink(content, selectedPrimarySourceText, externalLinkInput)
    await resetLocalState()
  }

  const handleCreateConnection = async () => {
    if (localConnectionType === EXTERNAL) {
      await onCreateExternalConnection()
    } else if (localForeignEntryId) {
      await onCreateConnection()
    } else {
      const newNode = await dispatch(createNodeEntry({ title: newNodeTitle }))
      const newForeignEntryId = newNode?.payload ?? null

      if (!newForeignEntryId) {
        console.error('Failed to create new node - no valid ID returned:', newNode)
        showToast('Failed to create new node', 'error')
        return
      }

      await dispatch(
        createConnection({
          connection_type: localConnectionType,
          current_entry_id: entryId,
          foreign_entry_id: localConnectionType === PARENT ? entryId : newForeignEntryId,
          primary_entry_id: localConnectionType === PARENT ? newForeignEntryId : entryId,
          primary_source: connectionSourceType === DESCRIPTIVE ? connectionDescription : selectedPrimarySourceText,
          foreign_source: connectionSourceType === DIRECT ? selectedForeignSourceText : null,
          source_type: connectionSourceType,
        })
      )
      await resetLocalState()
    }
  }

  const handleDeleteConnection = async (id) => {
    dispatch(deleteConnection(id))
  }

  const handleEditNodeClick = (c) => {
    dispatch(closeModal())
  }
  const getConnUpdateIds = (conn, connType) => {
    if (connType === PARENT)
      return {
        foreign_entry_id: entryId,
        primary_entry_id: conn.foreign_entry_id,
      }

    if (connType === CHILD)
      return {
        foreign_entry_id: conn.primary_entry_id === entryId ? conn.foreign_entry_id : conn.primary_entry_id,
        primary_entry_id: entryId,
      }
    // Since Sibling's foreign and primaries don't matter, don't change
    if (connType === SIBLING)
      return {
        foreign_entry_id: conn.foreign_entry_id,
        primary_entry_id: conn.primary_entry_id,
      }
    // TODO this else may be a little fucked
    else
      return {
        foreign_entry_id: conn.primary_entry_id,
        primary_entry_id: entryId,
      }
  }

  const handleEditConnectionType = (e, conn) => {
    dispatch(
      updateConnection({
        connectionId: conn.id,
        updatedFields: {
          connection_type: FRONT_TO_BACK_CONN_TYPES[e.target.value],
          foreign_entry_id: getConnUpdateIds(conn, e.target.value).foreign_entry_id,
          primary_entry_id: getConnUpdateIds(conn, e.target.value).primary_entry_id,
        },
        current_entry_id: entryId,
      })
    )
  }

  const highlightedPrimaryContent = highlightMatchingText(content, selectedPrimarySourceText)
  const highlightedForeignContent = highlightMatchingText(localForeignEntryContent, selectedForeignSourceText)

  // Filter connection types based on isTopLevel status
  const availableConnectionTypes = isTopLevel
    ? Object.values(CONNECTION_TYPES.FRONTEND).filter((type) => type !== PARENT)
    : Object.values(CONNECTION_TYPES.FRONTEND)

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.CONNECTIONS} className={styles.modal} onOpen={handleModalOpen}>
      <div className={styles.wrapper}>
        <h2 className={styles.titleWrapper}>
          connect <span className={styles.title}>{title}</span> to:
        </h2>
        <div className={styles.flexContainer}>
          <p>Type:</p>
          <DefaultDropdown
            className={styles.createDropdown}
            value={localConnectionType}
            options={availableConnectionTypes}
            onChange={(e) => setLocalConnectionType(e.target.value)}
            tooltip={'Change connection type'}
          />
          {localConnectionType !== EXTERNAL && (
            <>
              <span>Node:</span>
              <NodeSelectDropdown
                className={styles.nodeSelect}
                onChange={(value) => setNewNodeTitle(value)}
                onSelect={(value) => setLocalForeignEntryId(value)}
                setInputValue={(e) => dispatch(setConnectionTitleInput(e))}
                inputValue={connectionTitleInput}
              />
            </>
          )}
        </div>
        <HorizontalDivider className={styles.horizontalDivider} height={SMALL} />
        {localConnectionType !== EXTERNAL && (
          <div className={styles.flexContainer}>
            <p>Connection Source Type:</p>
            <DefaultDropdown
              className={styles.createDropdown}
              value={connectionSourceType}
              options={Object.values(CONNECTION_SOURCE_TYPES)}
              onChange={(e) => dispatch(setConnectionSourceType(e.target.value))}
              tooltip={'Change connection source type'}
            />
          </div>
        )}
        <div className={styles.sourceSelectionContainer}>
          {localConnectionType === EXTERNAL ? (
            <div className={styles.entrySourceContainer}>
              <div className={styles.sourceSelectContainer}>
                <DefaultButton className={styles.getSourceButton} onClick={() => dispatch(getSelectedText(PRIMARY))}>
                  Select Text to Link
                </DefaultButton>
              </div>
              <div className={styles.entrySource} dangerouslySetInnerHTML={{ __html: highlightedPrimaryContent }} />
              <input
                className={styles.externalConnectionInput}
                value={externalLinkInput}
                onChange={(e) => setExternalLinkInput(e.target.value)}
                placeholder="Enter external connection link"
              />
            </div>
          ) : null}
          {(connectionSourceType === DIRECT || connectionSourceType === SINGLE_WORD) &&
          localConnectionType !== EXTERNAL ? (
            <>
              <div className={styles.entrySourceContainer}>
                <div className={styles.sourceSelectContainer}>
                  <h4 className={styles.entrySourceHeader}>Primary Entry Source</h4>
                  <DefaultButton className={styles.getSourceButton} onClick={() => dispatch(getSelectedText(PRIMARY))}>
                    Select Text
                  </DefaultButton>
                </div>
                <div className={styles.entrySource} dangerouslySetInnerHTML={{ __html: highlightedPrimaryContent }} />
              </div>
              {localForeignEntryId ? (
                <div className={styles.entrySourceContainer}>
                  <div className={styles.sourceSelectContainer}>
                    <h4 className={styles.entrySourceHeader}>Foreign Entry Source</h4>
                    <DefaultButton
                      className={styles.getSourceButton}
                      onClick={() => dispatch(getSelectedText(FOREIGN))}
                    >
                      Select Text
                    </DefaultButton>
                  </div>
                  <div className={styles.entrySource} dangerouslySetInnerHTML={{ __html: highlightedForeignContent }} />
                </div>
              ) : null}
            </>
          ) : null}
          {connectionSourceType === DESCRIPTIVE && localConnectionType !== EXTERNAL ? (
            <textarea
              className={styles.connectionDescriptionTextarea}
              value={connectionDescription}
              onChange={(e) => setConnectionDescription(e.target.value)}
              placeholder="Enter optional connection description..."
            />
          ) : null}
        </div>
        <HorizontalDivider className={styles.horizontalDivider} />
        <div className={styles.createContainer}>
          <DefaultButton onClick={handleCreateConnection}>Create {localConnectionType} connection</DefaultButton>
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
                    <div className={styles.connectionLabel}>{c.connection_type === EXTERNAL ? 'link:' : 'node:'}</div>
                    {c.connection_type === EXTERNAL ? (
                      <a target="_blank" rel="noopener noreferrer" href={c.foreign_source}>
                        {c.primary_source ? c.primary_source : 'click here'}
                      </a>
                    ) : (
                      <EditNodeLink
                        className={styles.connectionText}
                        node={{
                          id: entryId === c.foreign_entry_id ? c.primary_entry_id : c.foreign_entry_id,
                          title: entryId === c.foreign_entry_id ? c.primary_entry_title : c.foreign_entry_title,
                        }}
                        onClick={() => handleEditNodeClick(c)}
                      />
                    )}
                    <div className={styles.connectionLabel}>type:</div>
                    <DefaultDropdown
                      className={styles.createDropdown}
                      value={c.connection_type}
                      options={Object.values(CONNECTION_TYPES.FRONTEND)}
                      onChange={(e) => handleEditConnectionType(e, c)}
                      tooltip={'Change connection type'}
                    />
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
