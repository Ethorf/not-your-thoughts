import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

// Constants
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { CONNECTION_TYPES } from '@constants/connectionTypes'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

// Redux
import { createConnection } from '@redux/reducers/connectionsReducer'
import {
  dismissShinyTextSuggestion,
  fetchShinyTextDismissals,
} from '@redux/reducers/currentEntryReducer'

// Utils
import { createFormatRules, formatContentWithConnections } from '@utils/formatContentWithConnections'
import { clearShinyTextAnimationStarts } from '@utils/shinyTextAnimation'
import {
  buildShinyTextCandidates,
  getConnectedSourceKeys,
  getDismissedSuggestedEntryIds,
  shinyTextCandidatesToMap,
} from '@utils/shinyTextCandidates'

import styles from './FormattedTextOverlay.module.scss'

const { DIRECT } = CONNECTION_SOURCE_TYPES
const {
  FRONTEND: { SIBLING },
} = CONNECTION_TYPES

// const MAIN_TOP_OFFSET = 16
const MAIN_TOP_OFFSET = 0

const FormattedTextOverlay = ({ quillRef, toolbarVisible }) => {
  const [quillEditorScrollTopVal, setQuillEditorScrollTopVal] = useState(0)
  const [scrollbarWidth, setScrollbarWidth] = useState(0)
  const [editorFocused, setEditorFocused] = useState(false)

  const { connections } = useSelector((state) => state.connections)
  const { content, entryId, title: currentTitle, shinyTextDismissals } = useSelector((state) => state.currentEntry)
  const history = useHistory()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const dispatch = useDispatch()

  const allTitles = useMemo(
    () => nodeEntriesInfo?.map((x) => x?.title?.toLowerCase()).filter((t) => t !== currentTitle.toLowerCase()) ?? [],
    [currentTitle, nodeEntriesInfo]
  )

  const connectedSourceKeys = useMemo(
    () => getConnectedSourceKeys(connections, entryId, nodeEntriesInfo),
    [connections, entryId, nodeEntriesInfo]
  )

  const dismissedSuggestedEntryIds = useMemo(
    () => getDismissedSuggestedEntryIds(shinyTextDismissals),
    [shinyTextDismissals]
  )

  useEffect(() => {
    if (!entryId) return
    dispatch(fetchShinyTextDismissals(entryId))
  }, [dispatch, entryId])

  useEffect(() => {
    return () => {
      clearShinyTextAnimationStarts(entryId)
    }
  }, [entryId])

  const shinyTextCandidates = useMemo(
    () =>
      buildShinyTextCandidates({
        nodeEntriesInfo,
        currentTitle,
        connectedSourceKeys,
        dismissedSuggestedEntryIds,
      }),
    [nodeEntriesInfo, currentTitle, connectedSourceKeys, dismissedSuggestedEntryIds]
  )

  const shinyTextCandidateMap = useMemo(
    () => shinyTextCandidatesToMap(shinyTextCandidates),
    [shinyTextCandidates]
  )

  const handleRedirectToNode = useCallback(
    (id) => {
      history.push(`/edit-node-entry?entryId=${id}`)
    },
    [history]
  )

  const handleCreateSimpleSiblingConnection = useCallback(
    async (nodeId) => {
      if (!nodeId) return
      await dispatch(
        createConnection({
          connection_type: SIBLING,
          current_entry_id: entryId,
          foreign_entry_id: nodeId,
          primary_entry_id: entryId,
          primary_source: nodeEntriesInfo.find((n) => n.id === nodeId)?.title || '',
          foreign_source: nodeEntriesInfo.find((n) => n.id === nodeId)?.title || '',
          source_type: DIRECT,
        })
      )
    },
    [dispatch, entryId, nodeEntriesInfo]
  )

  const handleDismissShinySuggestion = useCallback(
    (candidate) => {
      if (!candidate?.nodeId || !entryId) return
      dispatch(
        dismissShinyTextSuggestion({
          entryId,
          suggestedEntryId: candidate.nodeId,
        })
      )
    },
    [dispatch, entryId]
  )

  const handleCreateConnectionFromSuggestion = useCallback(
    async (candidate) => {
      if (!candidate?.nodeId) return
      await handleCreateSimpleSiblingConnection(candidate.nodeId)
    },
    [handleCreateSimpleSiblingConnection]
  )

  const shinyTextOptions = useMemo(
    () => ({
      entryId,
      candidateMap: shinyTextCandidateMap,
      onDismiss: handleDismissShinySuggestion,
      onCreateConnection: handleCreateConnectionFromSuggestion,
    }),
    [entryId, shinyTextCandidateMap, handleDismissShinySuggestion, handleCreateConnectionFromSuggestion]
  )

  const formatRules = useMemo(() => {
    return createFormatRules(connections, entryId, handleRedirectToNode, null, styles, nodeEntriesInfo)
  }, [connections, entryId, handleRedirectToNode, nodeEntriesInfo])

  const formattedContent = useMemo(() => {
    return formatContentWithConnections(
      content,
      formatRules,
      allTitles,
      null,
      nodeEntriesInfo,
      'node found, click to create connection',
      true,
      shinyTextOptions
    )
  }, [content, formatRules, allTitles, nodeEntriesInfo, shinyTextOptions])

  const initialTopValue = toolbarVisible ? 51 + MAIN_TOP_OFFSET : MAIN_TOP_OFFSET

  useEffect(() => {
    if (!quillRef.current) return

    const quill = quillRef.current.getEditor()
    const root = quill.root

    const syncEditorFocused = () => {
      setEditorFocused(document.activeElement === root || root.contains(document.activeElement))
    }

    root.addEventListener('focus', syncEditorFocused)
    root.addEventListener('blur', syncEditorFocused)
    syncEditorFocused()

    return () => {
      root.removeEventListener('focus', syncEditorFocused)
      root.removeEventListener('blur', syncEditorFocused)
    }
  }, [quillRef, content])

  // Mostly event listeners and scroll stuff
  useEffect(() => {
    if (!quillRef.current) return

    const quill = quillRef.current.getEditor()
    const root = quill.root

    const update = () => {
      setQuillEditorScrollTopVal(root.scrollTop)

      // Calculate scrollbar width by comparing offsetWidth (includes scrollbar) with clientWidth (excludes scrollbar)
      const hasVerticalScrollbar = root.scrollHeight > root.clientHeight
      const scrollbarWidthValue = hasVerticalScrollbar ? root.offsetWidth - root.clientWidth : 0
      setScrollbarWidth(scrollbarWidthValue)
    }

    const rafUpdate = () => {
      requestAnimationFrame(update)
    }

    root.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    const resizeObserver = new ResizeObserver(rafUpdate)
    resizeObserver.observe(root)

    update()

    const contentTimeout = setTimeout(() => {
      update()
    }, 250)

    return () => {
      root.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      resizeObserver.disconnect()
      clearTimeout(contentTimeout)
    }
  }, [quillRef, content])

  return (
    <div
      id="Formatted Text Overlay Boy"
      className={classNames(styles.wrapper, editorFocused && styles.editorFocused)}
      style={{
        top: `${initialTopValue - quillEditorScrollTopVal}px`,
        paddingRight: `${scrollbarWidth}px`,
      }}
    >
      {formattedContent}
    </div>
  )
}

export default FormattedTextOverlay
