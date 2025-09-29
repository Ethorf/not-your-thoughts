import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

import { setEntryById } from '@redux/reducers/currentEntryReducer'
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './NodeSearch.module.scss'

const NodeSearch = ({
  mode = 'filter', // 'filter' for dashboard, 'navigate' for explore
  onFilterChange = null, // callback for filter mode
  placeholder = 'Search nodes...',
  className = '',
  showResults = true,
  maxResults = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const nodeEntriesInfo = useNodeEntriesInfo()
  const dispatch = useDispatch()
  const history = useHistory()

  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim() || !nodeEntriesInfo) return []

    const term = searchTerm.toLowerCase()
    return nodeEntriesInfo
      .filter((node) => node.title?.toLowerCase().includes(term) || node.content?.toLowerCase().includes(term))
      .slice(0, maxResults)
  }, [searchTerm, nodeEntriesInfo, maxResults])

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(value.length > 0 && mode !== 'filter') // Disable dropdown in filter mode
    setSelectedIndex(-1)

    // Call filter callback if in filter mode
    if (mode === 'filter' && onFilterChange) {
      onFilterChange(value)
    }
  }

  // Handle node selection
  const handleNodeSelect = (node) => {
    if (mode === 'navigate') {
      // Navigate to the selected node - dispatch first, then update URL
      dispatch(setEntryById(node.id))
      history.push(`/explore?entryId=${node.id}`)
    } else if (mode === 'filter' && onFilterChange) {
      // Update filter with selected node title
      setSearchTerm(node.title)
      onFilterChange(node.title)
    }

    setIsOpen(false)
    setSearchTerm('')
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredNodes.length === 0) return

    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredNodes.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredNodes.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredNodes.length) {
          handleNodeSelect(filteredNodes[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear search when component unmounts or mode changes
  useEffect(() => {
    return () => {
      setSearchTerm('')
      setIsOpen(false)
    }
  }, [mode])

  return (
    <div className={classNames(styles.nodeSearch, className)}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(searchTerm.length > 0 && mode !== 'filter')}
        placeholder={placeholder}
        className={styles.searchInput}
      />

      {isOpen && showResults && filteredNodes.length > 0 && mode !== 'filter' && (
        <div ref={resultsRef} className={styles.results}>
          {filteredNodes.map((node, index) => (
            <div
              key={node.id}
              className={classNames(styles.resultItem, { [styles.selected]: index === selectedIndex })}
              onClick={() => handleNodeSelect(node)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={styles.nodeTitle}>{node.title}</div>
              {node.content && <div className={styles.nodePreview}>{node.content.substring(0, 100)}...</div>}
            </div>
          ))}
        </div>
      )}

      {isOpen && showResults && filteredNodes.length === 0 && searchTerm.length > 0 && mode !== 'filter' && (
        <div ref={resultsRef} className={styles.results}>
          <div className={styles.noResults}>No nodes found</div>
        </div>
      )}
    </div>
  )
}

export default NodeSearch
