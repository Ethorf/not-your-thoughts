import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntries } from '../../redux/reducers/nodeEntriesReducer'
import Spinner from '../Shared/Spinner/Spinner'
import { NodeEntry } from '../NodeEntry/NodeEntry'
import { EntriesSortDropdown } from '../Shared/EntriesSortDropdown/EntriesSortDropdown'

import styles from './NodeEntriesList.module.scss'

const NodeEntriesList = () => {
  const dispatch = useDispatch()
  const allNodeEntries = useSelector((state) => state.nodeEntries.allNodeEntries.entries)

  const [sortedEntries, setSortedEntries] = useState([])

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

  return (
    <div>
      <h2 className={styles.nodesTitle}>Nodes</h2>
      {allNodeEntries.length ? (
        <>
          <div>
            Sort By:
            <EntriesSortDropdown
              entries={allNodeEntries}
              sortOptions={sortOptions}
              setSortedEntries={setSortedEntries}
            />
          </div>
          <div className={styles.divider} />
          <ul className={styles.listContainer}>
            {sortedEntries.map((nodeEntry) => (
              <NodeEntry key={nodeEntry.id} node={nodeEntry} />
            ))}
          </ul>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  )
}

export default NodeEntriesList
