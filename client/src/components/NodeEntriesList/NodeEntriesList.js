import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Redux
import { fetchNodeEntries } from '@redux/reducers/nodeEntriesReducer'

// Components
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import { NodeEntry } from '../NodeEntry/NodeEntry'
import { EntriesSortDropdown } from '@components/Shared/EntriesSortDropdown/EntriesSortDropdown'
import { EntriesSearchBar } from '@components/Shared/EntriesSearchBar/EntriesSearchBar'

import styles from './NodeEntriesList.module.scss'

const NodeEntriesList = () => {
  const dispatch = useDispatch()

  const { nodeEntriesLoading, allNodeEntries } = useSelector((state) => state.nodeEntries)

  const [filteredEntries, setFilteredEntries] = useState([])
  const [sortedAndFilteredEntries, setSortedAndFilteredEntries] = useState([])

  // TODO will probably need this to be an object so that it can have a label / icon thing too and also just abstract it into a constant so it's easily different for nodes / journels
  const sortOptions = [
    'title a-z',
    'title z-a',
    'date modified newest first',
    'date modifed oldest first',
    'date created newest first',
    'date created oldest first',
  ]

  useEffect(() => {
    dispatch(fetchNodeEntries())
  }, [dispatch])

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.nodesTitle}>Nodes</h2>
      {nodeEntriesLoading ? (
        <div className={styles.loader}>
          <SmallSpinner />
          Loading Nodes...
        </div>
      ) : allNodeEntries?.length ? (
        <>
          <div className={styles.searchSortContainer}>
            <EntriesSearchBar data={allNodeEntries} setFilteredEntries={setFilteredEntries} />
            <div>
              Sort By:
              <EntriesSortDropdown
                entries={filteredEntries}
                sortOptions={sortOptions}
                setSortedEntries={setSortedAndFilteredEntries}
              />
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.headerContainer}>
            <p className={styles.listHeader}>Title</p>
            <p className={styles.listHeader}>Modified</p>
            <p className={styles.listHeader}>Created</p>
            <p className={styles.listHeader}>Content</p>
          </div>
          <div className={styles.divider} />
          <ul className={styles.listContainer}>
            {sortedAndFilteredEntries.map((nodeEntry) => (
              <NodeEntry key={nodeEntry.id} node={nodeEntry} />
            ))}
          </ul>
        </>
      ) : (
        <h3>No Nodes created yet...</h3>
      )}
    </div>
  )
}

export default NodeEntriesList
