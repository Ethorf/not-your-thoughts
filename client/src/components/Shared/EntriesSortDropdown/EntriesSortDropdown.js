import React, { useEffect } from 'react'
import styles from './EntriesSortDropdown.module.scss'

export const EntriesSortDropdown = ({ sortOptions, setSortedEntries, entries }) => {
  useEffect(() => {
    setSortedEntries(sortBy(entries, 'date modified newest first'))
  }, [entries, setSortedEntries])

  const sortBy = (arr, option) => {
    switch (option) {
      case 'title a-z':
        return arr.slice().sort((a, b) => a.title.localeCompare(b.title))
      case 'title z-a':
        return arr.slice().sort((a, b) => b.title.localeCompare(a.title))
      case 'date modified newest first':
        return arr.slice().sort((a, b) => new Date(b.date[0]) - new Date(a.date[0]))
      case 'date modified oldest first':
        return arr.slice().sort((a, b) => new Date(a.date[0]) - new Date(b.date[0]))
      case 'date created newest first':
        return arr.slice().sort((a, b) => new Date(b.date[b.date.length - 1]) - new Date(a.date[a.date.length - 1]))
      case 'date created oldest first':
        return arr.slice().sort((a, b) => new Date(a.date[a.date.length - 1]) - new Date(b.date[b.date.length - 1]))
      default:
        return arr
    }
  }

  const handleSortByChange = (event) => {
    const selectedOption = event.target.value
    setSortedEntries(sortBy(entries, selectedOption))
  }

  return (
    <select className={styles.wrapper} defaultValue={'date modified newest first'} onChange={handleSortByChange}>
      {sortOptions.map((option, index) => (
        <option key={index} value={option.value}>
          {option}
        </option>
      ))}
    </select>
  )
}
