import React, { useMemo } from 'react'
import classNames from 'classnames'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import styles from './PublicHistoryDiff.module.scss'

const PublicHistoryDiff = ({ currentContent, previousContent, selectedVersionIndex }) => {
  const calculateDiff = (oldText, newText) => {
    if (!oldText && !newText) return []
    if (!oldText) return [{ type: 'add', text: newText }]
    if (!newText) return [{ type: 'remove', text: oldText }]

    // Use a word-level diff algorithm for better accuracy
    // First, extract text content from HTML for comparison
    const stripHtml = (html) => {
      if (!html) return ''
      const temp = document.createElement('div')
      temp.innerHTML = html
      return temp.textContent || temp.innerText || ''
    }

    const oldTextContent = stripHtml(oldText)
    const newTextContent = stripHtml(newText)

    // Split into words, but don't treat spaces as separate tokens
    const oldWords = oldTextContent.split(/\s+/).filter((word) => word.length > 0)
    const newWords = newTextContent.split(/\s+/).filter((word) => word.length > 0)

    // Use a smarter LCS algorithm that handles word extensions better
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

      // Add remaining elements from old text (removals)
      while (i > 0) {
        result.unshift({ type: 'remove', text: arr1[i - 1] })
        i--
      }
      // Add remaining elements from new text (additions - this handles additions at the end)
      while (j > 0) {
        result.unshift({ type: 'add', text: arr2[j - 1] })
        j--
      }

      // Post-process to handle word extensions better
      const processedResult = []
      for (let k = 0; k < result.length; k++) {
        const current = result[k]
        const next = result[k + 1]

        // Check if this is a case where a word is being extended
        if (current.type === 'remove' && next && next.type === 'add') {
          const removedWord = current.text
          const addedWord = next.text

          // Check if the added word starts with the removed word (extension case)
          if (addedWord.startsWith(removedWord) && removedWord.length > 0) {
            // Mark the common prefix as equal, and the suffix as added
            processedResult.push({ type: 'equal', text: removedWord })
            processedResult.push({ type: 'add', text: addedWord.substring(removedWord.length) })
            k++ // Skip the next item since we processed it
            continue
          }
        }

        processedResult.push(current)
      }

      return processedResult
    }

    return lcs(oldWords, newWords)
  }

  const diff = useMemo(() => {
    if (selectedVersionIndex === null || selectedVersionIndex === undefined) {
      return null
    }
    return calculateDiff(previousContent || '', currentContent || '')
  }, [currentContent, previousContent, selectedVersionIndex])

  if (!diff || diff.length === 0) {
    return <div>{extractTextFromHTML(currentContent || '')}</div>
  }

  return (
    <div className={styles.diffContent}>
      {diff.map((part, index) => (
        <span
          key={index}
          className={classNames(styles.diffPart, {
            [styles.added]: part.type === 'add',
            [styles.removed]: part.type === 'remove',
            [styles.equal]: part.type === 'equal',
          })}
        >
          {extractTextFromHTML(part.text)}
          {index < diff.length - 1 && ' '}
        </span>
      ))}
    </div>
  )
}

export default PublicHistoryDiff

