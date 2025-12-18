import { useMemo, useCallback } from 'react'

/**
 * Custom hook to filter entry contents and handle version selection
 * Filters out versions with minimal changes (below threshold) using Levenshtein distance
 */
const useFilteredEntryContents = (entryContents, isHistoryExpanded, setIsHistoryExpanded, setDisplayContent, setSelectedVersionIndex) => {
  // Get filtered contents to properly find previous version for diff
  const filteredEntryContents = useMemo(() => {
    if (!entryContents || entryContents.length === 0) return []

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

  // Handle toggling history panel
  const handleToggleHistory = useCallback(() => {
    setIsHistoryExpanded(!isHistoryExpanded)
    if (isHistoryExpanded) {
      // Reset to current content when closing history
      setDisplayContent(null)
      setSelectedVersionIndex(null)
    }
  }, [isHistoryExpanded, setIsHistoryExpanded, setDisplayContent, setSelectedVersionIndex])

  // Handle version selection - finds the index in the filtered list
  const handleVersionSelect = useCallback(
    (selectedContent, originalIndex) => {
      setDisplayContent(selectedContent)
      // Find the index in the filtered list
      const filteredIndex = filteredEntryContents.findIndex(
        (content) => content.id === entryContents[originalIndex]?.id
      )
      setSelectedVersionIndex(filteredIndex >= 0 ? filteredIndex : originalIndex)
    },
    [filteredEntryContents, entryContents, setDisplayContent, setSelectedVersionIndex]
  )

  return {
    filteredEntryContents,
    handleToggleHistory,
    handleVersionSelect,
  }
}

export default useFilteredEntryContents

