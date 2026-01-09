import { useMemo, useCallback } from 'react'

/**
 * Custom hook to handle entry contents and version selection
 * Note: Server already filters contents using Levenshtein distance, so we just pass through
 */
const useFilteredEntryContents = (
  entryContents,
  isHistoryExpanded,
  setIsHistoryExpanded,
  setDisplayContent,
  setSelectedVersionIndex
) => {
  // Server already filters contents, so we just return them directly
  // This avoids expensive client-side Levenshtein calculations that were causing crashes
  const filteredEntryContents = useMemo(() => {
    if (!entryContents || entryContents.length === 0) return []
    return entryContents
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

  // Handle version selection - since server filters, filtered = original
  const handleVersionSelect = useCallback(
    (selectedContent, originalIndex) => {
      setDisplayContent(selectedContent)
      setSelectedVersionIndex(originalIndex)
    },
    [setDisplayContent, setSelectedVersionIndex]
  )

  return {
    filteredEntryContents,
    handleToggleHistory,
    handleVersionSelect,
  }
}

export default useFilteredEntryContents
