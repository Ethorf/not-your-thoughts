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

  useEffect(() => {
    // Reset selected index when entryId changes
    if (lastFetchedEntryId !== null && lastFetchedEntryId !== entryId) {
      setSelectedIndex(0)
      setLastFetchedEntryId(null)
    }
  }, [entryId, lastFetchedEntryId])

  useEffect(() => {
    // Fetch if expanded and either no contents or contents are for a different entry
    if (isExpanded && (entryContents.length === 0 || lastFetchedEntryId !== entryId)) {
      dispatch(fetchPublicEntryContents({ entryId, userId })).then(() => {
        setLastFetchedEntryId(entryId)
        setSelectedIndex(0)
      })
    }
  }, [isExpanded, entryContents.length, dispatch, entryId, userId, lastFetchedEntryId])

  const handleVersionSelect = (index) => {
    setSelectedIndex(index)
    if (onVersionSelect && entryContents[index]) {
      onVersionSelect(entryContents[index].content, index)
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

  if (entryContentsLoading) {
    return (
      <div className={styles.wrapper}>
        <SmallSpinner />
      </div>
    )
  }

  if (entryContents.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyMessage}>No content history found for this entry.</div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.versionList}>
        {entryContents.map((content, index) => (
          <button
            key={content.id}
            className={classNames(styles.versionButton, {
              [styles.selected]: index === selectedIndex,
            })}
            onClick={() => handleVersionSelect(index)}
          >
            <div className={styles.versionInfo}>
              <span className={styles.versionNumber}>v{entryContents.length - index}</span>
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
