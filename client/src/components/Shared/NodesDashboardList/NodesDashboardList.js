import React, { useState, useMemo } from 'react'
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import { DashboardNodeEntry } from '@components/DashboardNodeEntry/DashboardNodeEntry'
import NodeSearch from '@components/Shared/NodeSearch/NodeSearch'
import { filterAndSortNodesBySearch } from '@utils/nodeSearchRelevance'
import styles from './NodesDashboardList.module.scss'

export const NodesDashboardList = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const [sortBy, setSortBy] = useState('recent')
  const [searchFilter, setSearchFilter] = useState('')

  const filteredAndSortedNodes = useMemo(() => {
    let filtered = [...nodeEntriesInfo]

    // Apply search filter if provided — relevance-ranked (title matches first)
    if (searchFilter.trim()) {
      return filterAndSortNodesBySearch(filtered, searchFilter)
    }

    if (sortBy === 'recent') {
      return filtered.sort((a, b) => new Date(b.date_last_modified) - new Date(a.date_last_modified))
    }

    return filtered.sort((a, b) => {
      if (a.starred && !b.starred) return -1
      if (!a.starred && b.starred) return 1
      if (a.pending && !b.pending) return -1
      if (!a.pending && b.pending) return 1
      return new Date(b.date_last_modified) - new Date(a.date_last_modified)
    })
  }, [nodeEntriesInfo, sortBy, searchFilter])

  return (
    <div className={styles.wrapper}>
      <div className={styles.topContainer}>
        <div className={styles.searchContainer}>
          <NodeSearch
            mode="filter"
            onFilterChange={setSearchFilter}
            placeholder="Search nodes..."
            className={styles.searchComponent}
          />
        </div>
        <label className={styles.sortLabel}>
          Sort:
          <select className={styles.sortControls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default</option>
            <option value="recent">Recent</option>
          </select>
        </label>
      </div>

      {filteredAndSortedNodes.length ? (
        <ul className={styles.nodesList}>
          {filteredAndSortedNodes.map((node) => (
            <DashboardNodeEntry key={node.id} nodeEntriesInfo={nodeEntriesInfo} node={node} />
          ))}
        </ul>
      ) : searchFilter.trim() ? (
        <h3>No nodes found matching "{searchFilter}"</h3>
      ) : (
        <h3>No nodes created yet...</h3>
      )}
    </div>
  )
}
