import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

// Constants
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { CONNECTION_TYPES } from '@constants/connectionTypes'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

// Redux
import { createConnection } from '@redux/reducers/connectionsReducer'
import { dismissShinyTextSuggestion, fetchShinyTextDismissals } from '@redux/reducers/currentEntryReducer'

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
import { normalizeQuillListHtml } from '@utils/normalizeQuillListHtml'

const { DIRECT } = CONNECTION_SOURCE_TYPES
const {
  FRONTEND: { PARENT },
} = CONNECTION_TYPES

// const MAIN_TOP_OFFSET = 16
const MAIN_TOP_OFFSET = 0

const FormattedTextOverlay = ({ quillRef, toolbarVisible }) => {
  const [quillEditorScrollTopVal, setQuillEditorScrollTopVal] = useState(0)
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

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

  const shinyTextCandidateMap = useMemo(() => shinyTextCandidatesToMap(shinyTextCandidates), [shinyTextCandidates])

  const handleRedirectToNode = useCallback(
    (id) => {
      history.push(`/edit-node-entry?entryId=${id}`)
    },
    [history]
  )

  const handleCreateConnectionFromSuggestion = useCallback(
    async (candidate, connectionType, matchedText) => {
      if (!candidate?.nodeId || !entryId || !connectionType) return

      const suggestedNodeId = candidate.nodeId
      const suggestedTitle = candidate.title || ''
      const matchedSource = matchedText || suggestedTitle
      const isParent = connectionType === PARENT

      await dispatch(
        createConnection({
          connection_type: connectionType,
          current_entry_id: entryId,
          primary_entry_id: isParent ? suggestedNodeId : entryId,
          foreign_entry_id: isParent ? entryId : suggestedNodeId,
          primary_source: isParent ? suggestedTitle : matchedSource,
          foreign_source: isParent ? matchedSource : suggestedTitle,
          source_type: DIRECT,
        })
      )
    },
    [dispatch, entryId]
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
    const normalizedContent = normalizeQuillListHtml(content)

    return formatContentWithConnections(
      normalizedContent,
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
      className={styles.wrapper}
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
