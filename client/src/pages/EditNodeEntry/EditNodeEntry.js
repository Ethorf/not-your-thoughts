import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import classNames from 'classnames'
import { useLocation, useHistory } from 'react-router-dom'
import { unwrapResult } from '@reduxjs/toolkit'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { setTitle, saveNodeEntry, setEntryById, toggleEntryIsPrivate } from '@redux/reducers/currentEntryReducer'
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
import EditorSelectionContextMenu from '@components/Shared/CreateEntry/EditorSelectionContextMenu'
import useIsMobile from '@hooks/useIsMobile'

import styles from './EditNodeEntry.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

const UNTITLED_TITLE_PATTERN = /^Untitled #\d+$/i

const EditNodeEntry = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const titleInputRef = useRef(null)
  const editorRegionRef = useRef(null)
  const settingsCogRef = useRef(null)
  const hasAutoSelectedTitleRef = useRef(false)
  const lastNonEmptyTitleRef = useRef('')
  const [nodeMenu, setNodeMenu] = useState(null)

  const { wordCount, entryId, title, starred, isPrivate, entriesLoading } = useSelector((state) => state.currentEntry)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const isMobile = useIsMobile()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const entryIdParam = useMemo(() => normalizeEntryId(params.get('entryId')), [params])
  const loadedEntryId = normalizeEntryId(entryId)
  // Hide the editor until the URL entry matches loaded state — prevents flashing the previous node.
  const isLoadingEntry = entryIdParam != null && entryIdParam !== loadedEntryId

  useEffect(() => {
    if (entryIdParam != null) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, entryIdParam])

  useEffect(() => {
    if (entryId) {
      dispatch(fetchConnections(entryId))
    }
  }, [dispatch, entryId])

  // Reset auto-select when switching nodes.
  useEffect(() => {
    hasAutoSelectedTitleRef.current = false
  }, [entryId])

  useEffect(() => {
    if (title?.trim()) {
      lastNonEmptyTitleRef.current = title.trim()
    }
  }, [title])

  useEffect(() => {
    const nodeName = title?.trim()
    document.title = !isLoadingEntry && nodeName ? `NYT: ${nodeName}` : 'NYT'
    return () => {
      document.title = 'Not Your Thoughts'
    }
  }, [isLoadingEntry, title])

  // After creating a node, focus the title and select "Untitled #…" so typing replaces it.
  useEffect(() => {
    const shouldSelectTitle = Boolean(location.state?.selectTitle)
    if (!shouldSelectTitle || hasAutoSelectedTitleRef.current) {
      return
    }

    if (entryId == null || !title || !UNTITLED_TITLE_PATTERN.test(title.trim())) {
      return
    }

    const input = titleInputRef.current
    if (!input) {
      return
    }

    const frameId = requestAnimationFrame(() => {
      input.focus()
      input.select()
      hasAutoSelectedTitleRef.current = true
      history.replace(`/edit-node-entry?entryId=${entryId}`)
    })

    return () => cancelAnimationFrame(frameId)
  }, [location.state, entryId, title, history])

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleTitleBlur = useCallback(() => {
    if (entryId == null) {
      return
    }

    if (!title?.trim()) {
      const fallbackTitle = lastNonEmptyTitleRef.current || `Untitled #${entryId}`
      dispatch(setTitle(fallbackTitle))
    }

    dispatch(saveNodeEntry({ saveType: SAVE_TYPES.AUTO }))
  }, [dispatch, entryId, title])

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
      return
    }

    // Skip header action buttons — go straight to the body editor.
    if (e.key === 'Tab' && !e.shiftKey) {
      const editor = editorRegionRef.current?.querySelector('.ql-editor')
      if (editor) {
        e.preventDefault()
        e.currentTarget.blur()
        editor.focus()
      }
    }
  }, [])

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

  const handleCloseNodeMenu = useCallback(() => {
    setNodeMenu(null)
  }, [])

  const handleToggleNodeMenu = useCallback(() => {
    const cog = settingsCogRef.current
    if (!cog) {
      return
    }

    setNodeMenu((current) => {
      if (current) {
        return null
      }

      const rect = cog.getBoundingClientRect()
      return {
        left: rect.right - 220,
        top: rect.bottom + 6,
      }
    })
  }, [])

  const nodeMenuOptions = useMemo(() => {
    const options = [
      {
        id: 'private',
        label: isPrivate ? 'Private ✓' : 'Private',
        onClick: handleToggleIsPrivate,
      },
    ]

    if (isAuthenticated && user?.id) {
      options.push({
        id: 'public-mode',
        label: 'Public Mode',
        onClick: () => history.push(`/show-node-entry?userId=${user.id}&entryId=${entryId}`),
      })
    }

    options.push(
      {
        id: 'explore',
        label: 'Explore',
        onClick: () => history.push('/explore'),
      },
      {
        id: 'history',
        label: 'History',
        onClick: () => history.push('/history'),
      },
      {
        id: 'delete',
        label: 'Delete',
        danger: true,
        onClick: handleOpenDeleteConfirm,
      }
    )

    return options
  }, [entryId, handleOpenDeleteConfirm, handleToggleIsPrivate, history, isAuthenticated, isPrivate, user?.id])

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

  if (isLoadingEntry) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <WritingDataManager entryType={ENTRY_TYPES.NODE} handleAutosave={() => handleSaveNode(SAVE_TYPES.AUTO)} />
      {!isMobile && <NodeGoalProgressPanel />}
      <div className={styles.editContainer}>
        <div className={styles.topContainer}>
          {isMobile ? (
            <div className={styles.titleInputContainer}>
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
              <DefaultInput
                ref={titleInputRef}
                className={classNames(styles.titleInput, sharedStyles.flexCenter, {
                  [styles.titleInputNoBorder]: (title ?? '').length,
                })}
                placeholder={'Enter Title'}
                value={title ?? ''}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
              />
              <span className={styles.mobileAkas}>
                <AkasDisplay />
              </span>
            </div>
          ) : (
            <>
              <div className={styles.actionsRow}>
                <div className={styles.actionsLeft}>
                  {entriesLoading ? (
                    <SmallSpinner />
                  ) : (
                    <DefaultButton
                      onClick={() => handleSaveNode(SAVE_TYPES.MANUAL)}
                      className={styles.actionButton}
                    >
                      Save Node
                    </DefaultButton>
                  )}
                </div>
                <div className={styles.titleCluster}>
                  <StarButton id={entryId} initialStarred={starred} />
                  <DefaultInput
                    ref={titleInputRef}
                    className={classNames(styles.titleInput, sharedStyles.flexCenter, {
                      [styles.titleInputNoBorder]: (title ?? '').length,
                    })}
                    placeholder={'Enter Title'}
                    value={title ?? ''}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                  <AkasDisplay />
                </div>
                <div className={styles.actionsRight}>
                  <button
                    ref={settingsCogRef}
                    type="button"
                    className={styles.settingsCog}
                    onClick={handleToggleNodeMenu}
                    data-tooltip-id="main-tooltip"
                    data-tooltip-content="Node options"
                    aria-label="Open node options"
                    aria-expanded={nodeMenu != null}
                  >
                    <CogIcon className={styles.cogIcon} />
                  </button>
                </div>
              </div>
              <EditorSelectionContextMenu
                menuState={nodeMenu}
                options={nodeMenuOptions}
                onClose={handleCloseNodeMenu}
                anchorRef={settingsCogRef}
              />
            </>
          )}
        </div>
        <div className={styles.connectionLinesWrapper} ref={editorRegionRef}>
          {!isMobile && <ConnectionLines entryId={entryId} />}
          <CreateEntry entryType={ENTRY_TYPES.NODE} fillHeight />
        </div>
        <div className={classNames(styles.grid3Columns, styles.bottomBar)}>
          <span className={classNames(sharedStyles.flexStart, styles.historyCell, styles.wordsCell)} />
          {!isMobile && (
            <span className={classNames(sharedStyles.flexCenter, styles.wordsCell)}>Words: {wordCount}</span>
          )}
          <span className={classNames(sharedStyles.flexCenter, styles.saveCell)}>
            {isMobile ? (
              entriesLoading ? (
                <SmallSpinner />
              ) : (
                <DefaultButton onClick={() => handleSaveNode(SAVE_TYPES.MANUAL)} className={styles.saveButton}>
                  Save
                </DefaultButton>
              )
            ) : (
              <DefaultButton
                tooltip="Open connections menu"
                onMouseDown={captureEditorSelectionForModal}
                onClick={handleOpenConnectionsModal}
                className={styles.saveButton}
              >
                Connect
              </DefaultButton>
            )}
          </span>
          {isMobile && <span className={styles.wordCount}>Words: {wordCount}</span>}
          {isMobile && <span className={styles.bottomBarSpacer} aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}

export default EditNodeEntry
