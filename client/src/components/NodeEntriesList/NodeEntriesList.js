import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntries } from '../../redux/reducers/nodeEntriesReducer'
import Spinner from '../Shared/Spinner/Spinner'
import { NodeEntry } from '../NodeEntry/NodeEntry'
import { EntriesSortDropdown } from '../Shared/EntriesSortDropdown/EntriesSortDropdown'
import { EntriesSearchBar } from '../Shared/EntriesSearchBar/EntriesSearchBar'

import styles from './NodeEntriesList.module.scss'

const NodeEntriesList = () => {
  const dispatch = useDispatch()

  // TODO fix this pointless nesting
  const allNodeEntries = useSelector((state) => state.nodeEntries.allNodeEntries.entries)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [sortedAndFilteredEntries, setSortedAndFilteredEntries] = useState([])

  // will probably need this to be an object so that it can have a label / icon thing too and also just abstract it into a constant so it's easily different for nodes / journels
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

  console.log('allNodeEntries is:')
  console.log(allNodeEntries)
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.nodesTitle}>Nodes</h2>
      {allNodeEntries.length ? (
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
