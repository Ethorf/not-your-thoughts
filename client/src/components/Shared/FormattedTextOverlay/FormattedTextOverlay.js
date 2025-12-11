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

// Utils
import { createFormatRules, formatContentWithConnections } from '@utils/formatContentWithConnections'

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

  const { connections } = useSelector((state) => state.connections)
  const { content, entryId, title: currentTitle } = useSelector((state) => state.currentEntry)
  const history = useHistory()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const dispatch = useDispatch()

  const allTitles = useMemo(
    () => nodeEntriesInfo?.map((x) => x?.title?.toLowerCase()).filter((t) => t !== currentTitle.toLowerCase()) ?? [],
    [currentTitle, nodeEntriesInfo]
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

  const formatRules = useMemo(() => {
    return createFormatRules(connections, entryId, handleRedirectToNode, null, styles)
  }, [connections, entryId, handleRedirectToNode])

  const formattedContent = useMemo(() => {
    return formatContentWithConnections(
      content,
      formatRules,
      allTitles,
      handleCreateSimpleSiblingConnection,
      nodeEntriesInfo,
      'node found, click to create connection'
    )
  }, [content, formatRules, allTitles, handleCreateSimpleSiblingConnection, nodeEntriesInfo])

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
