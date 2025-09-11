import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'

// Utils
import axiosInstance from '@utils/axiosInstance'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import Spinner from '@components/Shared/Spinner/Spinner'

// Styles
import styles from './History.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

const History = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { entryId, title } = useSelector((state) => state.currentEntry)

  const [entryContents, setEntryContents] = useState([])
  const [filteredContents, setFilteredContents] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Helper function to check if two HTML contents are meaningfully different
  const stripHtml = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  const calculateCharacterDifference = (str1, str2) => {
    if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0)

    const text1 = stripHtml(str1)
    const text2 = stripHtml(str2)

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

  const filterContentsWithChanges = (contents) => {
    if (contents.length === 0) return contents

    const filtered = [contents[0]] // Always include the first (most recent) content
    const threshold = 3 // Minimum character difference

    for (let i = 1; i < contents.length; i++) {
      const currentContent = contents[i]
      const previousContent = contents[i - 1]

      const difference = calculateCharacterDifference(currentContent.content, previousContent.content)

      if (difference >= threshold) {
        filtered.push(currentContent)
      }
    }

    return filtered
  }

  const fetchEntryContents = useCallback(async () => {
    if (!entryId) return

    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get(`/api/entries/entry_contents/${entryId}`)
      const allContents = response.data.contents
      const filtered = filterContentsWithChanges(allContents)

      setEntryContents(allContents)
      setFilteredContents(filtered)
      setSelectedIndex(0) // Start with the most recent
    } catch (err) {
      console.error('Failed to fetch entry contents:', err)
      setError('Failed to load entry history')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  useEffect(() => {
    fetchEntryContents()
  }, [fetchEntryContents])

  const handleBackToEdit = () => {
    history.push(`/edit-node-entry?entryId=${entryId}`)
  }

  const handleVersionSelect = (index) => {
    setSelectedIndex(index)
  }

  const getDiffContent = () => {
    if (filteredContents.length === 0) return null

    const currentContent = filteredContents[selectedIndex]?.content || ''
    const previousContent =
      selectedIndex < filteredContents.length - 1 ? filteredContents[selectedIndex + 1]?.content || '' : ''

    return {
      current: currentContent,
      previous: previousContent,
      diff: calculateDiff(previousContent, currentContent),
    }
  }

  const calculateDiff = (oldText, newText) => {
    if (!oldText && !newText) return []
    if (!oldText) return [{ type: 'add', text: newText }]
    if (!newText) return [{ type: 'remove', text: oldText }]

    // Use a word-level diff algorithm for better accuracy
    // First, extract text content from HTML for comparison
    const stripHtml = (html) => {
      const temp = document.createElement('div')
      temp.innerHTML = html
      return temp.textContent || temp.innerText || ''
    }

    const oldTextContent = stripHtml(oldText)
    const newTextContent = stripHtml(newText)

    // Split into words, but don't treat spaces as separate tokens
    const oldWords = oldTextContent.split(/\s+/).filter((word) => word.length > 0)
    const newWords = newTextContent.split(/\s+/).filter((word) => word.length > 0)

    // Use a simple LCS (Longest Common Subsequence) algorithm
    const lcs = (arr1, arr2) => {
      const m = arr1.length
      const n = arr2.length
      const dp = Array(m + 1)
        .fill()
        .map(() => Array(n + 1).fill(0))

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (arr1[i - 1] === arr2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
          }
        }
      }

      // Backtrack to find the LCS
      const result = []
      let i = m,
        j = n
      while (i > 0 && j > 0) {
        if (arr1[i - 1] === arr2[j - 1]) {
          result.unshift({ type: 'equal', text: arr1[i - 1] })
          i--
          j--
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
          result.unshift({ type: 'remove', text: arr1[i - 1] })
          i--
        } else {
          result.unshift({ type: 'add', text: arr2[j - 1] })
          j--
        }
      }

      // Add remaining elements
      while (i > 0) {
        result.unshift({ type: 'remove', text: arr1[i - 1] })
        i--
      }
      while (j > 0) {
        result.unshift({ type: 'add', text: arr2[j - 1] })
        j--
      }

      return result
    }

    return lcs(oldWords, newWords)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <h1>History</h1>
        <p className={styles.error}>{error}</p>
        <DefaultButton onClick={handleBackToEdit}>Back to Edit</DefaultButton>
      </div>
    )
  }

  if (filteredContents.length === 0) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <h1>History</h1>
        <p>No content history found for this entry.</p>
        <DefaultButton onClick={handleBackToEdit}>Back to Edit</DefaultButton>
      </div>
    )
  }

  const diffData = getDiffContent()

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <div className={styles.header}>
        <h1>History: {title}</h1>
        <DefaultButton onClick={handleBackToEdit}>Back to Edit</DefaultButton>
      </div>

      <div className={styles.content}>
        <div className={styles.versionSelector}>
          <h3>Select Version:</h3>
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
                <div
                  className={styles.versionPreview}
                  dangerouslySetInnerHTML={{
                    __html: content.content.substring(0, 100) + (content.content.length > 100 ? '...' : ''),
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.diffContainer}>
          <h3>
            Changes from v{filteredContents.length - selectedIndex - 1} to v{filteredContents.length - selectedIndex}
            {selectedIndex === filteredContents.length - 1 && ' (Initial Version)'}
          </h3>

          <div className={styles.diffContent}>
            {diffData &&
              diffData.diff.map((part, index) => (
                <span
                  key={index}
                  className={classNames(styles.diffPart, {
                    [styles.added]: part.type === 'add',
                    [styles.removed]: part.type === 'remove',
                    [styles.equal]: part.type === 'equal',
                  })}
                >
                  {part.text}
                  {index < diffData.diff.length - 1 && ' '}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default History
