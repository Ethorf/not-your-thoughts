import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import { fetchPublicEntryContents } from '@redux/reducers/currentEntryReducer'
import styles from './PublicHistory.module.scss'

const PublicHistory = ({ entryId, userId, isExpanded, onVersionSelect }) => {
  const dispatch = useDispatch()
  const { entryContents, entryContentsLoading } = useSelector((state) => state.currentEntry)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lastFetchedEntryId, setLastFetchedEntryId] = useState(null)

  // Server already filters contents using Levenshtein distance, so we just use them directly
  // This avoids expensive client-side calculations that were causing crashes
  const [filteredContents, setFilteredContents] = useState([])

  useEffect(() => {
    // Server already filters, so we just pass through the contents
    if (!isExpanded || entryContents.length === 0) {
      setFilteredContents([])
      return
    }
    setFilteredContents(entryContents)
  }, [isExpanded, entryContents])

  useEffect(() => {
    // Reset selected index when entryId changes
    if (lastFetchedEntryId !== null && lastFetchedEntryId !== entryId) {
      setSelectedIndex(0)
      setLastFetchedEntryId(null)
    }
  }, [entryId, lastFetchedEntryId])

  useEffect(() => {
    // If we already have contents and this is the current entry, mark as fetched
    if (entryContents.length > 0 && lastFetchedEntryId !== entryId && !entryContentsLoading) {
      setLastFetchedEntryId(entryId)
    }
  }, [entryContents.length, entryId, lastFetchedEntryId, entryContentsLoading])

  useEffect(() => {
    // Only fetch if expanded, we don't have contents yet, and we haven't already fetched for this entry
    if (isExpanded && entryContents.length === 0 && lastFetchedEntryId !== entryId && !entryContentsLoading) {
      dispatch(fetchPublicEntryContents({ entryId, userId })).then(() => {
        setLastFetchedEntryId(entryId)
        setSelectedIndex(0)
      })
    }
  }, [isExpanded, entryContents.length, dispatch, entryId, userId, lastFetchedEntryId, entryContentsLoading])

  const handleVersionSelect = (index) => {
    setSelectedIndex(index)
    if (onVersionSelect && filteredContents[index]) {
      // Map the filtered index back to the original entryContents index
      const originalIndex = entryContents.findIndex((content) => content.id === filteredContents[index].id)
      onVersionSelect(filteredContents[index].content, originalIndex >= 0 ? originalIndex : index)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getVersionPreview = (content) => {
    const textContent = extractTextFromHTML(content)
    return textContent.substring(0, 100) + (textContent.length > 100 ? '...' : '')
  }

  if (!isExpanded) {
    return null
  }

  // Show loading if:
  // 1. We're fetching contents and don't have any yet, OR
  // 2. We have contents but filteredContents hasn't been calculated yet (still empty)
  if (
    (entryContentsLoading && entryContents.length === 0) ||
    (entryContents.length > 0 && filteredContents.length === 0)
  ) {
    return (
      <div className={styles.wrapper}>
        <SmallSpinner />
      </div>
    )
  }

  // Show empty message only if we've finished loading, have no contents, and filteredContents is also empty
  if (!entryContentsLoading && entryContents.length === 0 && filteredContents.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyMessage}>No content history found for this entry.</div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.versionList}>
        {filteredContents.map((content, index) => (
          <button
            key={content.id}
            className={classNames(styles.versionButton, {
              [styles.selected]: index === selectedIndex,
            })}
            onClick={() => handleVersionSelect(index)}
          >
            <div className={styles.versionInfo}>
              <span className={styles.versionNumber}>v{filteredContents.length - index}</span>
              <span className={styles.versionDate}>{formatDate(content.date_created)}</span>
            </div>
            <div className={styles.versionPreview}>{getVersionPreview(content.content)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PublicHistory
