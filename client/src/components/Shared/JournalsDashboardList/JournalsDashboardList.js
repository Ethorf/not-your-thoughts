import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import { DashboardJournalEntry } from '@components/DashboardJournalEntry/DashboardJournalEntry'
import { fetchJournalEntries } from '@redux/reducers/journalEntriesReducer'
import { hasMeaningfulJournalContent } from '@utils/journalEntryContent'

import styles from '../NodesDashboardList/NodesDashboardList.module.scss'

export const JournalsDashboardList = () => {
  const dispatch = useDispatch()
  const { journalEntriesLoading, entries } = useSelector((state) => state.journalEntries)
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    dispatch(fetchJournalEntries())
  }, [dispatch])

  const allJournalEntries = Array.isArray(entries) ? entries : entries?.entries || []
  const savedJournalEntries = allJournalEntries.filter(hasMeaningfulJournalContent)

  const sortedJournals = useMemo(() => {
    const journals = [...savedJournalEntries]

    if (sortBy === 'oldest') {
      return journals.sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
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
        <label className={styles.sortLabel}>
          Sort:
          <select className={styles.sortControls} value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      {sortedJournals.length ? (
        <ul className={styles.nodesList}>
          {sortedJournals.map((journal) => (
            <DashboardJournalEntry key={journal.id} journal={journal} />
          ))}
        </ul>
      ) : (
        <h3>No journal entries created yet...</h3>
      )}
    </div>
  )
}
