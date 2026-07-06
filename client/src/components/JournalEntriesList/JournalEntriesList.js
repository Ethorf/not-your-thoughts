import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Redux
import { fetchJournalEntries } from '../../redux/reducers/journalEntriesReducer'

// Components
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import { JournalEntry } from '../JournalEntry/JournalEntry'
import { EntriesSortDropdown } from '../Shared/EntriesSortDropdown/EntriesSortDropdown'

import styles from './JournalEntriesList.module.scss'

const getLatestContentHtml = (content) => {
  if (typeof content === 'string') return content
  if (Array.isArray(content) && typeof content[0] === 'string') return content[0]
  return ''
}

const hasMeaningfulJournalContent = (journalEntry) => {
  const latestContent = getLatestContentHtml(journalEntry?.content)
  const textOnlyContent = latestContent
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

  return textOnlyContent.length > 0
}

const JournalEntriesList = () => {
  const dispatch = useDispatch()

  const {
    journalEntriesLoading,
    entries,
  } = useSelector((state) => state.journalEntries)
  const [sortedEntries, setSortedEntries] = useState([])
  const allJournalEntries = entries?.entries || []
  const savedJournalEntries = allJournalEntries.filter(hasMeaningfulJournalContent)

  const JOURNAL_SORT_OPTIONS = [
    'Most Words',
    'Least Words',
    'Longest Time',
    'Shortest Time',
    'Fastest WPM',
    'Slowest WPM',
    'Oldest First',
    'Newest First',
  ]

  useEffect(() => {
    dispatch(fetchJournalEntries())
  }, [dispatch])

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.nodesTitle}>Journals:</h2>
      {journalEntriesLoading ? (
        <div className={styles.loader}>
          <SmallSpinner />
          Loading Journals...
        </div>
      ) : savedJournalEntries.length ? (
        <>
          <div className={styles.searchSortContainer}>
            <div>
              Sort By:
              <EntriesSortDropdown
                entries={savedJournalEntries}
                sortOptions={JOURNAL_SORT_OPTIONS}
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
        <h2>No Journal Entries Created Yet...</h2>
      )}
    </div>
  )
}

export default JournalEntriesList
