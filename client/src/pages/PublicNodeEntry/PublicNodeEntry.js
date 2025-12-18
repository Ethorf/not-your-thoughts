import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import classNames from 'classnames'
import PublicConnectionLines from '@components/Shared/PublicConnectionLines/PublicConnectionLines'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicHistory from '@components/Shared/PublicHistory/PublicHistory'
import PublicHistoryModal from '@components/Shared/PublicHistoryModal/PublicHistoryModal'
import PublicConnectionsModal from '@components/Shared/PublicConnectionsModal/PublicConnectionsModal'
import PublicHistoryDiff from '@components/Shared/PublicHistoryDiff/PublicHistoryDiff'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import PublicFormattedContent from '@components/Shared/PublicFormattedContent/PublicFormattedContent'
import { markNodeAsRead, getNodeStatus } from '@utils/nodeReadStatus'
import useFilteredEntryContents from '@hooks/useFilteredEntryContents'
import useIsMobile from '@hooks/useIsMobile'
import styles from './PublicNodeEntry.module.scss'

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

  // Split selectors for better memoization - only re-render when specific fields change
  const entryId = useSelector((state) => state.currentEntry.entryId)
  const title = useSelector((state) => state.currentEntry.title)
  const content = useSelector((state) => state.currentEntry.content)
  const entriesLoading = useSelector((state) => state.currentEntry.entriesLoading)
  const entryContentsLoading = useSelector((state) => state.currentEntry.entryContentsLoading)
  const nodeEntriesInfo = useSelector((state) => state.currentEntry.nodeEntriesInfo, shallowEqual)
  const entryContents = useSelector((state) => state.currentEntry.entryContents, shallowEqual)
  const { connections, connectionsLoading } = useSelector((state) => state.connections, shallowEqual)
  const user = useSelector((state) => state.auth.user)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  const entryIdParam = params.get('entryId')
  const userIdParam = params.get('userId')

  // Check if the logged-in user is viewing their own content
  const isOwner = isAuthenticated && user?.id === userIdParam

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false)
  const [displayContent, setDisplayContent] = useState(null)
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(null)
  const [status, setStatus] = useState('unread')
  const isMobile = useIsMobile()
  const formattedContentWrapperRef = useRef(null)
  const centerIndicatorRef = useRef(null)
  const hasFetchedNodeEntriesRef = useRef(false)
  const lastEntryIdParamRef = useRef(null)
  const lastUserIdParamRef = useRef(null)

  // Use custom hook for filtered entry contents and history handlers
  const { filteredEntryContents, handleToggleHistory, handleVersionSelect } = useFilteredEntryContents(
    entryContents,
    isHistoryExpanded,
    setIsHistoryExpanded,
    setDisplayContent,
    setSelectedVersionIndex
  )

  // Fetch node entries info for search - use ref to avoid dependency on array
  useEffect(() => {
    if (!userIdParam) {
      return
    }

    // Reset ref if userId changes - this ensures we fetch fresh data for new users
    const userIdChanged = lastUserIdParamRef.current !== userIdParam
    if (userIdChanged) {
      hasFetchedNodeEntriesRef.current = false
      lastUserIdParamRef.current = userIdParam
      // Clear nodeEntriesInfo when switching users to prevent memory accumulation
      // The reducer will handle clearing, but we ensure we fetch fresh data
    }

    // Only fetch if we haven't fetched for this user yet and don't have data
    // Also fetch if userId changed (to get fresh data for new user)
    const hasNodeEntries = nodeEntriesInfo && nodeEntriesInfo.length > 0
    if ((!hasFetchedNodeEntriesRef.current && !hasNodeEntries) || userIdChanged) {
      hasFetchedNodeEntriesRef.current = true
      dispatch(fetchPublicNodeEntriesInfo(userIdParam)).catch((err) => {
        console.error('Error fetching node entries info:', err)
        hasFetchedNodeEntriesRef.current = false // Reset on error to allow retry
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userIdParam]) // Removed nodeEntriesInfo?.length to avoid re-fetching unnecessarily

  // Main entry fetch effect - optimized to only run when params change
  useEffect(() => {
    if (!entryIdParam || !userIdParam) {
      return
    }

    // Check if entry/user changed (using ref to track previous values)
    const entryChanged = lastEntryIdParamRef.current !== entryIdParam || lastUserIdParamRef.current !== userIdParam

    // Only fetch if we don't already have this entry loaded
    // Use entryId from closure (current Redux state) to check if we already have it
    if (!entryChanged && entryId === entryIdParam && title && content) {
      // Already have this entry, just check status and refresh connections
      setStatus(getNodeStatus(entryIdParam) || 'unread')
      // Still fetch connections in case they changed
      dispatch(fetchPublicConnections({ entryId: entryIdParam, userId: userIdParam })).catch((err) => {
        console.error('Error fetching connections:', err)
      })
      // Update refs even if not fetching
      lastEntryIdParamRef.current = entryIdParam
      lastUserIdParamRef.current = userIdParam
      return
    }

    // Update refs to track current params
    lastEntryIdParamRef.current = entryIdParam
    lastUserIdParamRef.current = userIdParam

    // Reset history state when entry changes
    if (entryChanged) {
      setDisplayContent(null)
      setSelectedVersionIndex(null)
      setIsHistoryExpanded(false)
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, entryIdParam, userIdParam]) // Intentionally omit entryId/title/content to avoid unnecessary re-runs

  // Also fetch history if entry is already loaded but we don't have history yet
  // Only fetch if not already loading to prevent duplicate requests
  useEffect(() => {
    if (
      entryId === entryIdParam &&
      entryId &&
      userIdParam &&
      entryContents.length === 0 &&
      !entryContentsLoading &&
      !entriesLoading
    ) {
      // Fetch history in background if entry is loaded but history isn't
      dispatch(fetchPublicEntryContents({ entryId: entryIdParam, userId: userIdParam })).catch((err) => {
        console.error('Error fetching entry contents:', err)
      })
    }
  }, [entryId, entryIdParam, userIdParam, entryContents.length, entryContentsLoading, entriesLoading, dispatch])

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

  if (!entryIdParam || !userIdParam) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>{!entryIdParam ? 'No entry ID provided' : 'No user ID provided'}</div>
      </div>
    )
  }

  // Show loading if we're currently fetching OR if we have params but no entry data yet (initial load)
  if (entriesLoading || (!entryId && !title && entryIdParam && userIdParam)) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  // Only show error if we've finished loading and still don't have the entry
  if (!entriesLoading && (!entryId || !title)) {
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
      <div className={styles.contentContainer}>
        <div className={styles.topContainer}>
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
            {isMobile ? (
              <DefaultButton
                onClick={() => setIsConnectionsModalOpen(true)}
                className={styles.networkButton}
                tooltip="View connections"
              >
                Connections
              </DefaultButton>
            ) : (
              <DefaultButton
                onClick={handleExploreNetwork}
                className={styles.networkButton}
                tooltip="Explore this node's network"
              >
                Network
              </DefaultButton>
            )}
          </div>
        </div>
        <div className={styles.connectionLinesWrapper}>
          {!connectionsLoading && !isMobile && (
            <PublicConnectionLines entryId={entryId} userId={userIdParam} connections={connections || []} />
          )}
        </div>
        <div className={classNames(styles.contentArea, isHistoryExpanded && styles.historyExpanded)}>
          <div className={styles.desktopHistory}>
            <PublicHistory
              entryId={entryId}
              userId={userIdParam}
              isExpanded={isHistoryExpanded}
              onVersionSelect={handleVersionSelect}
            />
          </div>
          {isMobile && (
            <>
              <PublicHistoryModal
                isOpen={isHistoryExpanded}
                onClose={handleToggleHistory}
                entryId={entryId}
                userId={userIdParam}
                onVersionSelect={handleVersionSelect}
              />
              <PublicConnectionsModal
                isOpen={isConnectionsModalOpen}
                onClose={() => setIsConnectionsModalOpen(false)}
                connections={connections || []}
                entryId={entryId}
                userId={userIdParam}
              />
            </>
          )}
          <div className={classNames(styles.content, isHistoryExpanded && styles.contentWithHistory)}>
            <div ref={centerIndicatorRef} className={styles.centerIndicator} />
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
            ) : (
              <div ref={formattedContentWrapperRef}>
                <PublicFormattedContent
                  content={content}
                  connections={connections}
                  entryId={entryId}
                  nodeEntriesInfo={nodeEntriesInfo}
                  userId={userIdParam}
                  title={title}
                  onInternalConnectionClick={handleInternalConnectionClick}
                  onExternalConnectionClick={handleExternalConnectionClick}
                  onUnconnectedNodeClick={handleUnconnectedNodeClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicNodeEntry
