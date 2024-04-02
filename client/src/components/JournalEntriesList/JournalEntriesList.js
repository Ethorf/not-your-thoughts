import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Redux
import { fetchJournalEntries } from '../../redux/reducers/journalEntriesReducer'

// Components
import Spinner from '../Shared/Spinner/Spinner'
import { JournalEntry } from '../JournalEntry/JournalEntry'
import { EntriesSortDropdown } from '../Shared/EntriesSortDropdown/EntriesSortDropdown'
import { EntriesSearchBar } from '../Shared/EntriesSearchBar/EntriesSearchBar'

import styles from './JournalEntriesList.module.scss'

const JournalEntriesList = () => {
  const dispatch = useDispatch()

  // TODO get rid of weird nesting here
  const allJournalEntries = useSelector((state) => state.journalEntries.entries.entries)
  const [sortedEntries, setSortedEntries] = useState([])

  // TODO extract into constant
  const sortOptions = [
    'Most Words',
    'Least Words',
    'Longest Time',
    'Shortest Time',
    'Fastest WPM',
    'Slowest WPM',
    'Oldest First',
    'Newest First',
  ]
  // TODO insert custom hook here
  useEffect(() => {
    dispatch(fetchJournalEntries())
  }, [dispatch])

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.nodesTitle}>Journals:</h2>
      {allJournalEntries.length ? (
        <>
          <div className={styles.searchSortContainer}>
            <div>
              Sort By:
              <EntriesSortDropdown
                entries={allJournalEntries}
                sortOptions={sortOptions}
                setSortedEntries={setSortedEntries}
              />
            </div>
          </div>
          <div className={styles.divider} />
          <ul className={styles.listContainer}>
            {sortedEntries.map((journalEntry) => (
              <JournalEntry key={journalEntry.id} journal={journalEntry} />
            ))}
          </ul>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  )
}

export default JournalEntriesList
