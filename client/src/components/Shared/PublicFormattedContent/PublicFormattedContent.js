import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createFormatRules, formatContentWithConnections } from '@utils/formatContentWithConnections'
import formattedTextStyles from '@components/Shared/FormattedTextOverlay/FormattedTextOverlay.module.scss'
import classNames from 'classnames'
import styles from './PublicFormattedContent.module.scss'

const PublicFormattedContent = ({
  content,
  connections,
  entryId,
  nodeEntriesInfo,
  userId,
  title,
  onInternalConnectionClick,
  onExternalConnectionClick,
  onUnconnectedNodeClick,
}) => {
  const lastParsedContentRef = useRef(null)
  const lastParsedDepsRef = useRef(null)
  const [parsedContent, setParsedContent] = useState(null)

  // Get all titles for highlighting (excluding current entry)
  const allTitles = useMemo(() => {
    if (!nodeEntriesInfo || nodeEntriesInfo.length === 0) return []
    const titleLower = title?.toLowerCase()
    return nodeEntriesInfo.map((x) => x?.title?.toLowerCase()).filter((t) => t && t !== titleLower)
  }, [title, nodeEntriesInfo])

  // Handle clicking on internal connections - navigate to node
  const handleInternalConnectionClick = useCallback(
    (nodeId) => {
      if (onInternalConnectionClick) {
        onInternalConnectionClick(nodeId)
      } else if (nodeId && userId) {
        // Fallback navigation if no callback provided
        window.location.href = `/show-node-entry?userId=${userId}&entryId=${nodeId}`
      }
    },
    [onInternalConnectionClick, userId]
  )

  // Handle clicking on external connections - open in new tab
  const handleExternalConnectionClick = useCallback(
    (url) => {
      if (onExternalConnectionClick) {
        onExternalConnectionClick(url)
      } else if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    },
    [onExternalConnectionClick]
  )

  // Handle clicking on unconnected nodes - navigate to node
  const handleUnconnectedNodeClick = useCallback(
    (nodeId) => {
      if (onUnconnectedNodeClick) {
        onUnconnectedNodeClick(nodeId)
      } else if (nodeId && userId) {
        // Fallback navigation if no callback provided
        window.location.href = `/show-node-entry?userId=${userId}&entryId=${nodeId}`
      }
    },
    [onUnconnectedNodeClick, userId]
  )

  // Create format rules from connections
  // Use refs for callbacks to prevent unnecessary re-creation of formatRules
  const handleInternalConnectionClickRef = useRef(handleInternalConnectionClick)
  const handleExternalConnectionClickRef = useRef(handleExternalConnectionClick)
  
  // Update refs when callbacks change
  useEffect(() => {
    handleInternalConnectionClickRef.current = handleInternalConnectionClick
    handleExternalConnectionClickRef.current = handleExternalConnectionClick
  }, [handleInternalConnectionClick, handleExternalConnectionClick])

  const formatRules = useMemo(() => {
    return createFormatRules(
      connections,
      entryId,
      (nodeId) => handleInternalConnectionClickRef.current?.(nodeId),
      (url) => handleExternalConnectionClickRef.current?.(url),
      formattedTextStyles
    )
  }, [connections, entryId]) // Removed callback dependencies

  // Use ref for handleUnconnectedNodeClick to prevent unnecessary re-parsing
  const handleUnconnectedNodeClickRef = useRef(handleUnconnectedNodeClick)
  useEffect(() => {
    handleUnconnectedNodeClickRef.current = handleUnconnectedNodeClick
  }, [handleUnconnectedNodeClick])

  useEffect(() => {
    if (!content) {
      setParsedContent(null)
      lastParsedContentRef.current = null
      lastParsedDepsRef.current = null
      return
    }

    // Create a dependency key to check if we need to re-parse
    // Use stringified content hash and lengths to avoid expensive comparisons
    const contentHash = typeof content === 'string' ? content.length + content.substring(0, 100) : String(content)
    const depsKey = JSON.stringify({
      contentHash,
      formatRulesKeys: Object.keys(formatRules || {}).sort(),
      allTitlesLength: allTitles?.length || 0,
      nodeEntriesInfoLength: nodeEntriesInfo?.length || 0,
    })

    // Skip parsing if dependencies haven't changed
    if (lastParsedDepsRef.current === depsKey && lastParsedContentRef.current) {
      setParsedContent(lastParsedContentRef.current)
      return
    }

    // Use requestIdleCallback for better browser scheduling, allowing user interactions to take priority
    let idleCallbackId = null
    let timeoutId = null

    const scheduleParse = () => {
      if (typeof requestIdleCallback !== 'undefined') {
        idleCallbackId = requestIdleCallback(
          () => {
            const formatted = formatContentWithConnections(
              content,
              formatRules,
              allTitles,
              (nodeId) => handleUnconnectedNodeClickRef.current?.(nodeId),
              nodeEntriesInfo,
              'node found, click to view',
              false // Disable ShinyText for public view
            )
            lastParsedContentRef.current = formatted
            lastParsedDepsRef.current = depsKey
            setParsedContent(formatted)
          },
          { timeout: 500 } // Increased timeout to reduce frequency of parsing during scrolling
        )
      } else {
        // Fallback for browsers without requestIdleCallback - use longer delay to allow scrolling
        timeoutId = setTimeout(() => {
          const formatted = formatContentWithConnections(
            content,
            formatRules,
            allTitles,
            (nodeId) => handleUnconnectedNodeClickRef.current?.(nodeId),
            nodeEntriesInfo,
            'node found, click to view',
            false // Disable ShinyText for public view
          )
          lastParsedContentRef.current = formatted
          lastParsedDepsRef.current = depsKey
          setParsedContent(formatted)
        }, 300) // Increased delay to let scroll events process
      }
    }

    scheduleParse()

    return () => {
      if (idleCallbackId !== null && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleCallbackId)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [content, formatRules, allTitles, nodeEntriesInfo]) // Removed handleUnconnectedNodeClick from deps

  if (!parsedContent) {
    return <div className={styles.wrapper}>No content yet...</div>
  }

  return (
    <div className={classNames(formattedTextStyles.wrapper, styles.formattedContentWrapper)}>
      {parsedContent}
    </div>
  )
}

export default PublicFormattedContent

