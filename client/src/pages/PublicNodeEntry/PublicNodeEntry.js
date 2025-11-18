import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import PublicConnectionLines from '@components/Shared/PublicConnectionLines/PublicConnectionLines'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicHistory from '@components/Shared/PublicHistory/PublicHistory'
import PublicHistoryDiff from '@components/Shared/PublicHistoryDiff/PublicHistoryDiff'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import { markNodeAsRead, getNodeStatus } from '@utils/nodeReadStatus'
import styles from './PublicNodeEntry.module.scss'
import formattedTextStyles from '@components/Shared/FormattedTextOverlay/FormattedTextOverlay.module.scss'

// Redux
import { fetchPublicEntry, fetchPublicNodeEntriesInfo } from '@redux/reducers/currentEntryReducer'
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

  const handleToggleHistory = useCallback(() => {
    setIsHistoryExpanded(!isHistoryExpanded)
    if (isHistoryExpanded) {
      // Reset to current content when closing history
      setDisplayContent(null)
      setSelectedVersionIndex(null)
    }
  }, [isHistoryExpanded])

  const handleVersionSelect = useCallback((selectedContent, index) => {
    setDisplayContent(selectedContent)
    setSelectedVersionIndex(index)
  }, [])

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
      })
      .catch((err) => {
        console.error('Error fetching entry:', err)
      })
  }, [dispatch, entryIdParam, userIdParam, entryId, title, content])

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

  // Parse HTML content similar to FormattedTextOverlay but without connection functionality
  const parsedContent = useMemo(() => {
    if (!content) return null

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')

    const transformNode = (node, paragraphIndex) => {
      if (!node) return null

      // TEXT NODE
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        return node.textContent
      }

      // ELEMENT NODE
      if (node.nodeType === Node.ELEMENT_NODE) {
        const children = safeTransformChildren(node.childNodes, paragraphIndex)

        if (!node.tagName) return children

        switch (node.tagName.toLowerCase()) {
          case 'strong':
            return <strong key={`${paragraphIndex}-${Math.random()}`}>{children}</strong>
          case 'em':
            return <em key={`${paragraphIndex}-${Math.random()}`}>{children}</em>
          case 'u':
            return <u key={`${paragraphIndex}-${Math.random()}`}>{children}</u>
          case 's':
          case 'del':
            return <s key={`${paragraphIndex}-${Math.random()}`}>{children}</s>
          case 'ul':
            return <ul key={`${paragraphIndex}-${Math.random()}`}>{children}</ul>
          case 'ol':
            return <ol key={`${paragraphIndex}-${Math.random()}`}>{children}</ol>
          case 'li':
            return <li key={`${paragraphIndex}-${Math.random()}`}>{children}</li>
          case 'p':
            return <p key={`${paragraphIndex}-${Math.random()}`}>{children}</p>
          default:
            return children
        }
      }

      return null
    }

    const safeTransformChildren = (childNodes, paragraphIndex) => {
      const result = []

      if (!childNodes || !childNodes.length) return result

      for (const child of childNodes) {
        try {
          const transformed = transformNode(child, paragraphIndex)
          if (Array.isArray(transformed)) {
            result.push(...transformed)
          } else if (transformed != null) {
            result.push(transformed)
          }
        } catch (e) {
          console.warn('Error transforming child node:', e, child)
        }
      }

      return result
    }

    const rootChildren = Array.from(doc.body.childNodes)

    return rootChildren.map((node, i) => transformNode(node, i))
  }, [content])

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
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>Entry not found</div>
      </div>
    )
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
          <DefaultButton
            onClick={handleToggleHistory}
            className={styles.historyButton}
            tooltip={'View history'}
            isSelected={isHistoryExpanded}
          >
            History
          </DefaultButton>
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
        </div>
        <div className={styles.connectionLinesWrapper}>
          {!connectionsLoading && (
            <PublicConnectionLines entryId={entryId} userId={userIdParam} connections={connections || []} />
          )}
          <div className={classNames(styles.contentArea, { [styles.withHistory]: isHistoryExpanded })}>
            <PublicHistory
              entryId={entryId}
              userId={userIdParam}
              isExpanded={isHistoryExpanded}
              onVersionSelect={handleVersionSelect}
            />
            <div className={styles.content}>
              {displayContent !== null && selectedVersionIndex !== null ? (
                <PublicHistoryDiff
                  currentContent={displayContent}
                  previousContent={
                    selectedVersionIndex < entryContents.length - 1
                      ? entryContents[selectedVersionIndex + 1]?.content || ''
                      : ''
                  }
                  selectedVersionIndex={selectedVersionIndex}
                />
              ) : parsedContent ? (
                <div className={classNames(formattedTextStyles.wrapper, styles.formattedContentWrapper)}>
                  {parsedContent}
                </div>
              ) : (
                'No content yet...'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicNodeEntry
