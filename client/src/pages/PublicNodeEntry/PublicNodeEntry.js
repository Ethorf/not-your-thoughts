import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import PublicConnectionLines from '@components/Shared/PublicConnectionLines/PublicConnectionLines'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicHistory from '@components/Shared/PublicHistory/PublicHistory'
import PublicHistoryDiff from '@components/Shared/PublicHistoryDiff/PublicHistoryDiff'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import { markNodeAsRead, getNodeStatus } from '@utils/nodeReadStatus'
import { createFormatRules, formatContentWithConnections } from '@utils/formatContentWithConnections'
import styles from './PublicNodeEntry.module.scss'
import formattedTextStyles from '@components/Shared/FormattedTextOverlay/FormattedTextOverlay.module.scss'

// Redux
import {
  fetchPublicEntry,
  fetchPublicNodeEntriesInfo,
  fetchPublicEntryContents,
} from '@redux/reducers/currentEntryReducer'
import { fetchPublicConnections } from '@redux/reducers/connectionsReducer'

import sharedStyles from '@styles/sharedClassnames.module.scss'

const PublicNodeEntry = () => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  const { entryId, title, content, entriesLoading, nodeEntriesInfo } = useSelector((state) => state.currentEntry)
  const { connections, connectionsLoading } = useSelector((state) => state.connections)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const entryIdParam = params.get('entryId')
  const userIdParam = params.get('userId')

  // Check if the logged-in user is viewing their own content
  const isOwner = isAuthenticated && user?.id === userIdParam

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [displayContent, setDisplayContent] = useState(null)
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(null)
  const [status, setStatus] = useState('unread')
  const { entryContents } = useSelector((state) => state.currentEntry)
  const contentContainerRef = useRef(null)
  const formattedContentWrapperRef = useRef(null)
  const [connectionLinesTop, setConnectionLinesTop] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport (below 680px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 680)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const handleToggleHistory = useCallback(() => {
    setIsHistoryExpanded(!isHistoryExpanded)
    if (isHistoryExpanded) {
      // Reset to current content when closing history
      setDisplayContent(null)
      setSelectedVersionIndex(null)
    }
  }, [isHistoryExpanded])

  // Get filtered contents to properly find previous version for diff
  const filteredEntryContents = useMemo(() => {
    if (entryContents.length === 0) return []

    const stripHtml = (html) => {
      if (!html || typeof html !== 'string') return ''
      const temp = document.createElement('div')
      temp.innerHTML = html
      return temp.textContent || temp.innerText || ''
    }

    const calculateCharacterDifference = (content1, content2) => {
      if (!content1 || !content2) return Math.max(content1?.length || 0, content2?.length || 0)
      const text1 = stripHtml(content1)
      const text2 = stripHtml(content2)

      // Simple Levenshtein distance calculation
      const matrix = []
      for (let i = 0; i <= text2.length; i++) {
        matrix[i] = [i]
      }
      for (let j = 0; j <= text1.length; j++) {
        matrix[0][j] = j
      }
      for (let i = 1; i <= text2.length; i++) {
        for (let j = 1; j <= text1.length; j++) {
          if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          }
        }
      }
      return matrix[text2.length][text1.length]
    }

    const filtered = [entryContents[0]] // Always include the first (most recent) content
    const threshold = 3 // Minimum character difference

    for (let i = 1; i < entryContents.length; i++) {
      const currentContent = entryContents[i]
      const previousContent = entryContents[i - 1]

      const difference = calculateCharacterDifference(currentContent.content, previousContent.content)

      if (difference >= threshold) {
        filtered.push(currentContent)
      }
    }

    return filtered
  }, [entryContents])

  const handleVersionSelect = useCallback(
    (selectedContent, originalIndex) => {
      setDisplayContent(selectedContent)
      // Find the index in the filtered list
      const filteredIndex = filteredEntryContents.findIndex(
        (content) => content.id === entryContents[originalIndex]?.id
      )
      setSelectedVersionIndex(filteredIndex >= 0 ? filteredIndex : originalIndex)
    },
    [filteredEntryContents, entryContents]
  )

  // Fetch node entries info for search
  useEffect(() => {
    if (!userIdParam) {
      return
    }
    // Only fetch if we don't have nodeEntriesInfo or it's for a different user
    if (!nodeEntriesInfo || nodeEntriesInfo.length === 0) {
      dispatch(fetchPublicNodeEntriesInfo(userIdParam)).catch((err) => {
        console.error('Error fetching node entries info:', err)
      })
    }
  }, [dispatch, userIdParam, nodeEntriesInfo])

  useEffect(() => {
    if (!entryIdParam || !userIdParam) {
      return
    }

    // Only fetch if we don't already have this entry loaded
    if (entryId === entryIdParam && title && content) {
      // Already have this entry, just check status
      setStatus(getNodeStatus(entryIdParam) || 'unread')
      // Still fetch connections in case they changed
      dispatch(fetchPublicConnections({ entryId: entryIdParam, userId: userIdParam })).catch((err) => {
        console.error('Error fetching connections:', err)
      })
      return
    }

    // Reset history state when entry changes
    setDisplayContent(null)
    setSelectedVersionIndex(null)
    setIsHistoryExpanded(false)

    // Check node status
    setStatus(getNodeStatus(entryIdParam) || 'unread')

    // Fetch entry data
    dispatch(fetchPublicEntry({ entryId: entryIdParam, userId: userIdParam }))
      .unwrap()
      .then(() => {
        // Mark node as read when entry is successfully loaded
        markNodeAsRead(entryIdParam)
        setStatus('read')

        // Fetch connections after entry is loaded
        dispatch(fetchPublicConnections({ entryId: entryIdParam, userId: userIdParam })).catch((err) => {
          console.error('Error fetching connections:', err)
          // Don't fail the whole component if connections fail
        })

        // Fetch history in the background (don't wait for it)
        dispatch(fetchPublicEntryContents({ entryId: entryIdParam, userId: userIdParam })).catch((err) => {
          console.error('Error fetching entry contents:', err)
          // Don't fail the whole component if history fails
        })
      })
      .catch((err) => {
        console.error('Error fetching entry:', err)
      })
  }, [dispatch, entryIdParam, userIdParam, entryId, title, content])

  // Also fetch history if entry is already loaded but we don't have history yet
  useEffect(() => {
    if (entryId === entryIdParam && entryId && userIdParam && entryContents.length === 0) {
      // Fetch history in background if entry is loaded but history isn't
      dispatch(fetchPublicEntryContents({ entryId: entryIdParam, userId: userIdParam })).catch((err) => {
        console.error('Error fetching entry contents:', err)
      })
    }
  }, [entryId, entryIdParam, userIdParam, entryContents.length, dispatch])

  // Calculate connection lines center position based on actual formattedContentWrapper height
  useEffect(() => {
    const calculateConnectionLinesPosition = () => {
      // Prefer measuring formattedContentWrapper if it exists, otherwise fall back to contentContainer
      const elementToMeasure = formattedContentWrapperRef.current || contentContainerRef.current

      if (elementToMeasure) {
        const rect = elementToMeasure.getBoundingClientRect()
        const elementHeight = rect.height
        const elementTop = rect.top
        const centerTop = elementTop + elementHeight / 2
        setConnectionLinesTop(centerTop)
      } else if (contentContainerRef.current) {
        // Fallback: measure contentContainer if formattedContentWrapper doesn't exist yet
        const containerRect = contentContainerRef.current.getBoundingClientRect()
        const containerHeight = containerRect.height
        const containerTop = containerRect.top
        const centerTop = containerTop + containerHeight / 2
        setConnectionLinesTop(centerTop)
      }
    }

    // Calculate initially and on window resize/content changes
    calculateConnectionLinesPosition()

    // Recalculate when content or history changes (with a small delay to allow DOM updates)
    const timeoutId = setTimeout(calculateConnectionLinesPosition, 100)

    window.addEventListener('resize', calculateConnectionLinesPosition)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', calculateConnectionLinesPosition)
    }
  }, [content, isHistoryExpanded, displayContent])

  const handleExploreNetwork = () => {
    if (entryId && userIdParam) {
      history.push(`/view-network?userId=${userIdParam}&entryId=${entryId}`)
    }
  }

  const handleEditEntry = () => {
    if (entryId) {
      history.push(`/edit-node-entry?entryId=${entryId}`)
    }
  }

  // Get all titles for highlighting (excluding current entry)
  const allTitles = useMemo(
    () => nodeEntriesInfo?.map((x) => x?.title?.toLowerCase()).filter((t) => t !== title?.toLowerCase()) ?? [],
    [title, nodeEntriesInfo]
  )

  // Handle clicking on internal connections - navigate to node
  const handleInternalConnectionClick = useCallback(
    (nodeId) => {
      if (nodeId && userIdParam) {
        history.push(`/show-node-entry?userId=${userIdParam}&entryId=${nodeId}`)
      }
    },
    [history, userIdParam]
  )

  // Handle clicking on external connections - open in new tab
  const handleExternalConnectionClick = useCallback((url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  // Handle clicking on unconnected nodes - navigate to node
  const handleUnconnectedNodeClick = useCallback(
    (nodeId) => {
      if (nodeId && userIdParam) {
        history.push(`/show-node-entry?userId=${userIdParam}&entryId=${nodeId}`)
      }
    },
    [history, userIdParam]
  )

  // Create format rules from connections
  const formatRules = useMemo(() => {
    return createFormatRules(
      connections,
      entryId,
      handleInternalConnectionClick,
      handleExternalConnectionClick,
      formattedTextStyles
    )
  }, [connections, entryId, handleInternalConnectionClick, handleExternalConnectionClick])

  // Parse HTML content with connection highlighting (same as FormattedTextOverlay)
  const parsedContent = useMemo(() => {
    return formatContentWithConnections(content, formatRules, allTitles, handleUnconnectedNodeClick, nodeEntriesInfo)
  }, [content, formatRules, allTitles, handleUnconnectedNodeClick, nodeEntriesInfo])

  if (!entryIdParam || !userIdParam) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>{!entryIdParam ? 'No entry ID provided' : 'No user ID provided'}</div>
      </div>
    )
  }

  if (entriesLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  if (!entryId || !title) {
    return <div className={styles.error}>Entry not found</div>
  }

  return (
    <div className={styles.wrapper}>
      <PublicLegend />
      <div className={styles.searchSection}>
        <PublicNodeSearch
          mode="navigate"
          placeholder="Search to explore..."
          className={styles.searchComponent}
          nodeEntriesInfo={nodeEntriesInfo || []}
          userId={userIdParam}
          collapsible={true}
        />
      </div>
      <div ref={contentContainerRef} className={styles.contentContainer}>
        <div className={styles.topContainer}>
          {!isMobile && (
            <div className={styles.leftButtons}>
              <DefaultButton
                onClick={handleToggleHistory}
                className={styles.historyButton}
                tooltip={'View history'}
                isSelected={isHistoryExpanded}
              >
                History
              </DefaultButton>
            </div>
          )}
          <div className={styles.titleContainer}>
            <div className={classNames(styles.title, sharedStyles.flexCenter)}>
              {title || 'Untitled'}
              {status === 'read' && (
                <span className={styles.readIndicator} data-tooltip-id="main-tooltip" data-tooltip-content="Read">
                  ✓
                </span>
              )}
              {status === 'updated' && (
                <span
                  className={classNames(styles.readIndicator, styles.updated)}
                  data-tooltip-id="main-tooltip"
                  data-tooltip-content="Updated"
                >
                  ●
                </span>
              )}
            </div>
          </div>
          {!isMobile && (
            <div className={styles.rightButtons}>
              {isOwner && (
                <DefaultButton onClick={handleEditEntry} className={styles.editButton} tooltip="Edit this entry">
                  Edit
                </DefaultButton>
              )}
              <DefaultButton
                onClick={handleExploreNetwork}
                className={styles.networkButton}
                tooltip="Explore this node's network"
              >
                Network
              </DefaultButton>
            </div>
          )}
          {isMobile && (
            <div className={styles.buttonRow}>
              <DefaultButton
                onClick={handleToggleHistory}
                className={styles.historyButton}
                tooltip={'View history'}
                isSelected={isHistoryExpanded}
              >
                History
              </DefaultButton>
              {isOwner && (
                <DefaultButton onClick={handleEditEntry} className={styles.editButton} tooltip="Edit this entry">
                  Edit
                </DefaultButton>
              )}
              <DefaultButton
                onClick={handleExploreNetwork}
                className={styles.networkButton}
                tooltip="Explore this node's network"
              >
                Network
              </DefaultButton>
            </div>
          )}
        </div>
        <div
          className={styles.connectionLinesWrapper}
          style={connectionLinesTop !== null ? { top: `${connectionLinesTop}px` } : undefined}
        >
          {!connectionsLoading && (
            <PublicConnectionLines entryId={entryId} userId={userIdParam} connections={connections || []} />
          )}
        </div>
        <div className={classNames(styles.contentArea, isHistoryExpanded && styles.historyExpanded)}>
          {!isMobile && (
            <PublicHistory
              entryId={entryId}
              userId={userIdParam}
              isExpanded={isHistoryExpanded}
              onVersionSelect={handleVersionSelect}
            />
          )}
          {isMobile && (
            <Modal
              open={isHistoryExpanded}
              onClose={handleToggleHistory}
              center
              classNames={{
                modal: styles.historyModal,
                overlay: styles.historyModalOverlay,
                closeButton: styles.historyModalCloseButton,
              }}
            >
              <PublicHistory
                entryId={entryId}
                userId={userIdParam}
                isExpanded={isHistoryExpanded}
                onVersionSelect={handleVersionSelect}
              />
            </Modal>
          )}
          <div className={classNames(styles.content, isHistoryExpanded && !isMobile && styles.contentWithHistory)}>
            {displayContent !== null && selectedVersionIndex !== null ? (
              <PublicHistoryDiff
                currentContent={displayContent}
                previousContent={
                  selectedVersionIndex < filteredEntryContents.length - 1
                    ? filteredEntryContents[selectedVersionIndex + 1]?.content || ''
                    : ''
                }
                selectedVersionIndex={selectedVersionIndex}
              />
            ) : parsedContent ? (
              <div
                ref={formattedContentWrapperRef}
                className={classNames(formattedTextStyles.wrapper, styles.formattedContentWrapper)}
              >
                {parsedContent}
              </div>
            ) : (
              'No content yet...'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicNodeEntry
