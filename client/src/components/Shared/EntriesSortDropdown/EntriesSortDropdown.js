import React, { useEffect, useState } from 'react'
import styles from './EntriesSortDropdown.module.scss'

export const EntriesSortDropdown = ({ sortOptions, setSortedEntries, entries }) => {
  const [selectedOption, setSelectedOption] = useState('date modified newest first')

  useEffect(() => {
    setSortedEntries(sortBy(entries, selectedOption))
  }, [entries, setSortedEntries, selectedOption])

  const sortBy = (arr, option) => {
    switch (option) {
      case 'title a-z':
        return arr.slice().sort((a, b) => a.title.localeCompare(b.title))
      case 'title z-a':
        return arr.slice().sort((a, b) => b.title.localeCompare(a.title))
      case 'date modified newest first':
        return arr.slice().sort((a, b) => new Date(b.date_last_modified) - new Date(a.date_last_modified))
      case 'date modified oldest first':
        return arr.slice().sort((a, b) => new Date(a.date_last_modified) - new Date(b.date_last_modified))
      case 'date created newest first':
        return arr.slice().sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
      case 'date created oldest first':
        return arr.slice().sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
      default:
        return arr
    }
  }

  const handleSortByChange = (event) => {
    setSelectedOption(event.target.value)
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
