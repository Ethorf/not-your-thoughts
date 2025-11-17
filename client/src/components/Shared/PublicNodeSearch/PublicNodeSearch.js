import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

import styles from './PublicNodeSearch.module.scss'

const PublicNodeSearch = ({
  mode = 'filter', // 'filter' for dashboard, 'navigate' for explore
  onFilterChange = null, // callback for filter mode
  placeholder = 'Search nodes...',
  className = '',
  showResults = true,
  maxResults = 10,
  nodeEntriesInfo = [],
  userId = null,
  collapsible = false, // Whether to show as collapsible icon
  navigateToNetwork = false, // If true, navigate to network view instead of node entry view
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const iconRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const history = useHistory()

  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim() || !nodeEntriesInfo || nodeEntriesInfo.length === 0) return []

    const term = searchTerm.toLowerCase()
    return nodeEntriesInfo
      .filter((node) => {
        const titleMatch = node.title?.toLowerCase().includes(term)
        const contentMatch = node.content?.some((c) => c?.toLowerCase().includes(term))
        return titleMatch || contentMatch
      })
      .slice(0, maxResults)
  }, [searchTerm, nodeEntriesInfo, maxResults])

  // Handle expand/collapse
  const handleToggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      clearTimeout(hoverTimeoutRef.current)
      // Focus input after expansion animation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else if (collapsible && !searchTerm.trim()) {
      handleCollapse()
    }
  }

  // Handle collapse
  const handleCollapse = () => {
    setIsExpanded(false)
    setIsOpen(false)
    setSearchTerm('')
    inputRef.current?.blur()
    clearTimeout(hoverTimeoutRef.current)
  }

  // Handle icon hover - auto-close after delay
  const handleIconMouseEnter = () => {
    if (isExpanded && collapsible) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = setTimeout(() => {
        if (!searchTerm.trim()) {
          handleCollapse()
        }
      }, 3000) // Auto-close after 3 seconds of hover
    }
  }

  const handleIconMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current)
  }

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(value.length > 0 && mode !== 'filter')
    setSelectedIndex(-1)

    // Expand if collapsed when typing
    if (!isExpanded && collapsible && value.length > 0) {
      setIsExpanded(true)
    }

    // Call filter callback if in filter mode
    if (mode === 'filter' && onFilterChange) {
      onFilterChange(value)
    }
  }

  // Handle node selection
  const handleNodeSelect = (node) => {
    if (mode === 'navigate' && userId) {
      if (navigateToNetwork) {
        history.push(`/view-network?userId=${userId}&entryId=${node.id}`)
      } else {
        history.push(`/show-node-entry?userId=${userId}&entryId=${node.id}`)
      }
    } else if (mode === 'filter' && onFilterChange) {
      setSearchTerm(node.title)
      onFilterChange(node.title)
    }

    setIsOpen(false)
    setSearchTerm('')
    inputRef.current?.blur()
    
    // Collapse if collapsible
    if (collapsible) {
      handleCollapse()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredNodes.length === 0) return

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
      default:
        break
    }
  }

  // Handle click outside to close dropdown and collapse if empty
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
        
        // Always collapse if collapsible and clicked outside
        if (collapsible && isExpanded) {
          handleCollapse()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      clearTimeout(hoverTimeoutRef.current)
    }
  }, [collapsible, isExpanded, searchTerm])

  // Clear search when component unmounts or mode changes
  useEffect(() => {
    return () => {
      setSearchTerm('')
      setIsOpen(false)
    }
  }, [mode])

  return (
    <div className={classNames(styles.nodeSearch, className, { [styles.collapsible]: collapsible })}>
      {collapsible && (
        <button
          ref={iconRef}
          className={styles.searchIcon}
          onClick={handleToggleExpand}
          onMouseEnter={handleIconMouseEnter}
          onMouseLeave={handleIconMouseLeave}
          aria-label="Search"
          data-tooltip-id="main-tooltip"
          data-tooltip-content="Search nodes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}
      <div className={classNames(styles.searchContainer, { [styles.expanded]: isExpanded })}>
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
          {filteredNodes.map((node, index) => {
            const previewText = node.content?.[0]
              ? node.content[0].replace(/<[^>]*>/g, '').substring(0, 100)
              : ''
            return (
              <div
                key={node.id}
                className={classNames(styles.resultItem, { [styles.selected]: index === selectedIndex })}
                onClick={() => handleNodeSelect(node)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.nodeTitle}>{node.title}</div>
                {previewText && <div className={styles.nodePreview}>{previewText}...</div>}
              </div>
            )
          })}
        </div>
      )}

      {isOpen && showResults && filteredNodes.length === 0 && searchTerm.length > 0 && mode !== 'filter' && (
        <div ref={resultsRef} className={styles.results}>
          <div className={styles.noResults}>No nodes found</div>
        </div>
      )}
      </div>
    </div>
  )
}

export default PublicNodeSearch

