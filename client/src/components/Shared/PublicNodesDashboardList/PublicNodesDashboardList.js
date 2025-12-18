import React, { useState, useMemo } from 'react'
import { PublicDashboardNodeEntry } from '@components/Shared/PublicDashboardNodeEntry/PublicDashboardNodeEntry'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import DefaultDropdown from '@components/Shared/DefaultDropdown/DefaultDropdown'
import calculateWordCount from '@utils/calculateWordCount'
import { getNodeStatus } from '@utils/nodeReadStatus'
import styles from './PublicNodesDashboardList.module.scss'

const getWordCount = (node) => {
  if (!node) {
    return 0
  }

  const {
    content,
    wdWordCount,
    num_of_words: numOfWords,
    wordCount: precomputedWordCount,
    calculatedWordCount: serverCalculatedWordCount,
  } = node

  const candidates = [
    precomputedWordCount,
    serverCalculatedWordCount,
    typeof wdWordCount === 'number' ? wdWordCount : null,
    typeof numOfWords === 'number' ? numOfWords : null,
  ]

  const firstValid = candidates.find((value) => typeof value === 'number' && value > 0)
  if (typeof firstValid === 'number') {
    return firstValid
  }

  const calculated = calculateWordCount(content)
  if (calculated > 0) {
    return calculated
  }

  return 0
}

const SORT_OPTIONS = [
  'Default',
  'Recent',
  'Most Words',
  'Least Words',
  'Most Connections',
  'Least Connections',
  'Read Status',
]

const SORT_VALUE_MAP = {
  Default: 'default',
  Recent: 'recent',
  'Most Words': 'mostWords',
  'Least Words': 'leastWords',
  'Most Connections': 'mostConnections',
  'Least Connections': 'leastConnections',
  'Read Status': 'readStatus',
}

const DISPLAY_TO_VALUE = (display) => SORT_VALUE_MAP[display] || display.toLowerCase().replace(/\s+/g, '')
const VALUE_TO_DISPLAY = (value) => {
  const entry = Object.entries(SORT_VALUE_MAP).find(([_, v]) => v === value)
  return entry ? entry[0] : value
}

export const PublicNodesDashboardList = ({ nodeEntriesInfo = [], userId = null }) => {
  const [sortBy, setSortBy] = useState('recent')
  const [searchFilter, setSearchFilter] = useState('')

  const filteredAndSortedNodes = useMemo(() => {
    let filtered = [...nodeEntriesInfo]

    // Apply search filter if provided
    if (searchFilter.trim()) {
      const term = searchFilter.toLowerCase()
      filtered = filtered.filter((node) => {
        const titleMatch = node.title?.toLowerCase().includes(term)
        const contentMatch = node.content?.some((c) => {
          if (typeof c === 'string') {
            return c.toLowerCase().includes(term)
          }
          return false
        })
        return titleMatch || contentMatch
      })
    }

    // Apply sorting
    if (sortBy === 'recent') {
      return filtered.sort((a, b) => {
        const dateA = new Date(a.date_last_modified || a.date_created || 0)
        const dateB = new Date(b.date_last_modified || b.date_created || 0)
        return dateB - dateA
      })
    }

    if (sortBy === 'mostWords') {
      return filtered.sort((a, b) => {
        const wordsA = getWordCount(a)
        const wordsB = getWordCount(b)
        return wordsB - wordsA
      })
    }

    if (sortBy === 'leastWords') {
      return filtered.sort((a, b) => {
        const wordsA = getWordCount(a)
        const wordsB = getWordCount(b)
        return wordsA - wordsB
      })
    }

    if (sortBy === 'mostConnections') {
      return filtered.sort((a, b) => {
        const connA = a.connectionCount || 0
        const connB = b.connectionCount || 0
        return connB - connA
      })
    }

    if (sortBy === 'leastConnections') {
      return filtered.sort((a, b) => {
        const connA = a.connectionCount || 0
        const connB = b.connectionCount || 0
        return connA - connB
      })
    }

    if (sortBy === 'readStatus') {
      return filtered.sort((a, b) => {
        const statusA = getNodeStatus(a.id)
        const statusB = getNodeStatus(b.id)

        // Order: updated > unread > read
        const statusOrder = { updated: 0, unread: 1, read: 2 }
        const orderA = statusOrder[statusA] ?? 2
        const orderB = statusOrder[statusB] ?? 2

        if (orderA !== orderB) {
          return orderA - orderB
        }

        // If same status, sort by date (most recent first)
        const dateA = new Date(a.date_last_modified || a.date_created || 0)
        const dateB = new Date(b.date_last_modified || b.date_created || 0)
        return dateB - dateA
      })
    }

    // Default sorting
    return filtered.sort((a, b) => {
      if (a.starred && !b.starred) return -1
      if (!a.starred && b.starred) return 1
      if (a.pending && !b.pending) return -1
      if (!a.pending && b.pending) return 1
      const dateA = new Date(a.date_last_modified || a.date_created || 0)
      const dateB = new Date(b.date_last_modified || b.date_created || 0)
      return dateB - dateA
    })
  }, [nodeEntriesInfo, sortBy, searchFilter])

  return (
    <>
      <div className={styles.topContainer}>
        <div className={styles.searchContainer}>
          <PublicNodeSearch
            mode="filter"
            onFilterChange={setSearchFilter}
            placeholder="Search nodes..."
            className={styles.searchComponent}
            nodeEntriesInfo={nodeEntriesInfo}
            userId={userId}
          />
        </div>
        <DefaultDropdown
          className={styles.sortControls}
          value={VALUE_TO_DISPLAY(sortBy)}
          options={SORT_OPTIONS}
          onChange={(e) => setSortBy(DISPLAY_TO_VALUE(e.target.value))}
        />
      </div>

      {filteredAndSortedNodes.length ? (
        <ul className={styles.wrapper}>
          {filteredAndSortedNodes.map((node) => (
            <PublicDashboardNodeEntry key={node.id} node={node} userId={userId} />
          ))}
        </ul>
      ) : searchFilter.trim() ? (
        <h3>No nodes found matching "{searchFilter}"</h3>
      ) : (
        <h3>No nodes found</h3>
      )}
    </>
  )
}
