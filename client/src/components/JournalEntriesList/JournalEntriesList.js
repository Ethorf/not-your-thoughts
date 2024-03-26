import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJournalEntries } from '../../redux/reducers/journalEntriesReducer'
import Spinner from '../Shared/Spinner/Spinner'
import { JournalEntry } from '../JournalEntry/JournalEntry'
import { EntriesSortDropdown } from '../Shared/EntriesSortDropdown/EntriesSortDropdown'
import { EntriesSearchBar } from '../Shared/EntriesSearchBar/EntriesSearchBar'

import styles from './JournalEntriesList.module.scss'

const JournalEntriesList = () => {
  const dispatch = useDispatch()

  // TODO get rid of weird nesting here
  const allJournalEntries = useSelector((state) => state.journalEntries.entries.entries)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [sortedAndFilteredEntries, setSortedAndFilteredEntries] = useState([])

  // will probably need this to be an object so that it can have a label / icon thing too and also just abstract it into a constant so it's easily different for nodes / journels
  const sortOptions = [
    'Most Words',
    'Least Words',
    'Longest Time',
    'Shortest Time',
    'Fastest WPM',
    'Slowest WPM',
    'Oldest frist',
    'Newest first',
  ]

  useEffect(() => {
    dispatch(fetchJournalEntries())
  }, [dispatch])

  console.log('allJournalEntries is:')
  console.log(allJournalEntries)

  // TODO think about if a search is really necessary for journals? (maybe when we have like sentiment analysis)
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.nodesTitle}>Journals:</h2>
      {allJournalEntries.length ? (
        <>
          <div className={styles.searchSortContainer}>
            {/* <EntriesSearchBar data={allJournalEntries} setFilteredEntries={setFilteredEntries} /> */}
            {/* <div>
              Sort By:
              <EntriesSortDropdown
                entries={filteredEntries}
                sortOptions={sortOptions}
                setSortedEntries={setSortedAndFilteredEntries}
              />
            </div> */}
          </div>
          <div className={styles.divider} />
          <ul className={styles.listContainer}>
            {allJournalEntries.map((journalEntry) => (
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
