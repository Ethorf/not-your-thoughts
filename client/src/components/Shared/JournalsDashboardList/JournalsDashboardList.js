import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'

import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import { DashboardJournalEntry } from '@components/DashboardJournalEntry/DashboardJournalEntry'
import { fetchJournalEntries } from '@redux/reducers/journalEntriesReducer'
import { hasMeaningfulJournalContent } from '@utils/journalEntryContent'

import styles from './JournalsDashboardList.module.scss'

const VIEW_LIST = 'list'
const VIEW_STREAM = 'stream'

export const JournalsDashboardList = () => {
  const dispatch = useDispatch()
  const { journalEntriesLoading, entries } = useSelector((state) => state.journalEntries)
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState(VIEW_LIST)

  useEffect(() => {
    dispatch(fetchJournalEntries())
  }, [dispatch])

  const savedJournalEntries = useMemo(() => {
    const allJournalEntries = Array.isArray(entries) ? entries : entries?.entries || []
    return allJournalEntries.filter(hasMeaningfulJournalContent)
  }, [entries])

  const sortedJournals = useMemo(() => {
    const journals = [...savedJournalEntries]
    const getWordCount = (journal) => Number(journal?.num_of_words) || 0

    if (sortBy === 'oldest') {
      return journals.sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
    }

    if (sortBy === 'most-words') {
      return journals.sort((a, b) => getWordCount(b) - getWordCount(a))
    }

    if (sortBy === 'least-words') {
      return journals.sort((a, b) => getWordCount(a) - getWordCount(b))
    }

    return journals.sort(
      (a, b) => new Date(b.date_last_modified || b.date_created) - new Date(a.date_last_modified || a.date_created)
    )
  }, [savedJournalEntries, sortBy])

  if (journalEntriesLoading) {
    return (
      <div className={styles.wrapper}>
        <SmallSpinner />
        Loading journals...
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topContainer}>
        <div className={styles.controls}>
          <label className={styles.controlLabel}>
            View:
            <select
              className={styles.controlSelect}
              value={viewMode}
              onChange={(event) => setViewMode(event.target.value)}
            >
              <option value={VIEW_LIST}>List</option>
              <option value={VIEW_STREAM}>Stream</option>
            </select>
          </label>
          <label className={styles.controlLabel}>
            Sort:
            <select
              className={styles.controlSelect}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="recent">Recent</option>
              <option value="oldest">Oldest</option>
              <option value="most-words">Most Words</option>
              <option value="least-words">Least Words</option>
            </select>
          </label>
        </div>
      </div>

      {sortedJournals.length ? (
        <ul
          className={classNames(styles.journalsList, {
            [styles.streamList]: viewMode === VIEW_STREAM,
          })}
        >
          {sortedJournals.map((journal) => (
            <DashboardJournalEntry key={journal.id} journal={journal} variant={viewMode} />
          ))}
        </ul>
      ) : (
        <h3>No journal entries created yet...</h3>
      )}
    </div>
  )
}
