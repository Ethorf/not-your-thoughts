import React, { useState, useEffect, useMemo, useCallback } from 'react'
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

  // Helper function to strip HTML and get text content
  const stripHtml = useCallback((html) => {
    if (!html || typeof html !== 'string') return ''
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }, [])

  // Calculate character difference between two HTML contents
  const calculateCharacterDifference = useCallback((content1, content2) => {
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
  }, [stripHtml])

  // Filter contents to only show versions with actual changes
  const filteredContents = useMemo(() => {
    if (entryContents.length === 0) return []

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
  }, [entryContents, calculateCharacterDifference])

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

  // Only show loading if we don't have contents yet AND are actually loading
  if (entryContentsLoading && entryContents.length === 0) {
    return (
      <div className={styles.wrapper}>
        <SmallSpinner />
      </div>
    )
  }

  // Show empty message only if we've finished loading and have no contents
  if (!entryContentsLoading && filteredContents.length === 0) {
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
