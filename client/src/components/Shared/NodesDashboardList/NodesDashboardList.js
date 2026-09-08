import React, { useState, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import useIsMobile from '@hooks/useIsMobile'
import { DashboardNodeEntry, getNodeWordCount } from '@components/DashboardNodeEntry/DashboardNodeEntry'
import NodeSearch from '@components/Shared/NodeSearch/NodeSearch'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import { filterAndSortNodesBySearch } from '@utils/nodeSearchRelevance'
import { showToast } from '@utils/toast'
import { normalizeEntryId } from '@utils/normalizeEntryId'
import {
  autosaveCurrentEntryIfNeeded,
  createNodeEntry,
  resetCurrentEntryState,
} from '@redux/reducers/currentEntryReducer'
import styles from './NodesDashboardList.module.scss'

export const NodesDashboardList = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const isMobile = useIsMobile()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const [sortBy, setSortBy] = useState('recent')
  const [searchFilter, setSearchFilter] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const trimmedSearch = searchFilter.trim()

  const hasExactTitleMatch = useMemo(() => {
    if (!trimmedSearch) {
      return false
    }

    const query = trimmedSearch.toLowerCase()
    return nodeEntriesInfo.some((node) => node.title?.toLowerCase() === query)
  }, [nodeEntriesInfo, trimmedSearch])

  const showCreateFromSearch = !isMobile && Boolean(trimmedSearch) && !hasExactTitleMatch

  const filteredAndSortedNodes = useMemo(() => {
    const filtered = [...nodeEntriesInfo]

    // Apply search filter if provided — relevance-ranked (title matches first)
    if (searchFilter.trim()) {
      return filterAndSortNodesBySearch(filtered, searchFilter)
    }

    if (sortBy === 'recent') {
      return filtered.sort((a, b) => new Date(b.date_last_modified) - new Date(a.date_last_modified))
    }

    if (sortBy === 'most-words') {
      return filtered.sort((a, b) => getNodeWordCount(b) - getNodeWordCount(a))
    }

    if (sortBy === 'least-words') {
      return filtered.sort((a, b) => getNodeWordCount(a) - getNodeWordCount(b))
    }

    if (sortBy === 'starred') {
      return filtered.sort((a, b) => {
        if (a.starred && !b.starred) return -1
        if (!a.starred && b.starred) return 1
        return new Date(b.date_last_modified) - new Date(a.date_last_modified)
      })
    }

    return filtered.sort((a, b) => {
      if (a.starred && !b.starred) return -1
      if (!a.starred && b.starred) return 1
      if (a.pending && !b.pending) return -1
      if (!a.pending && b.pending) return 1
      return new Date(b.date_last_modified) - new Date(a.date_last_modified)
    })
  }, [nodeEntriesInfo, sortBy, searchFilter])

  const handleCreateFromSearch = useCallback(async () => {
    if (!trimmedSearch || isCreating) {
      return
    }

    setIsCreating(true)
    try {
      await dispatch(autosaveCurrentEntryIfNeeded())
      dispatch(resetCurrentEntryState())
      const result = await dispatch(createNodeEntry({ title: trimmedSearch }))

      if (createNodeEntry.rejected.match(result)) {
        return
      }

      const newEntryId = normalizeEntryId(result.payload)
      if (newEntryId == null) {
        showToast('Failed to create node', 'error')
        return
      }

      history.push(`/edit-node-entry?entryId=${newEntryId}`)
    } finally {
      setIsCreating(false)
    }
  }, [dispatch, history, isCreating, trimmedSearch])

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
          {showCreateFromSearch ? (
            <DefaultButton
              className={styles.createFromSearchButton}
              onClick={handleCreateFromSearch}
              disabled={isCreating}
              tooltip={`Create node titled "${trimmedSearch}"`}
            >
              {isCreating ? 'Creating…' : 'Create'}
            </DefaultButton>
          ) : null}
        </div>
        <label className={styles.sortLabel}>
          Sort:
          <select className={styles.sortControls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default</option>
            <option value="recent">Recent</option>
            <option value="starred">Starred</option>
            <option value="most-words">Most Words</option>
            <option value="least-words">Least Words</option>
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
