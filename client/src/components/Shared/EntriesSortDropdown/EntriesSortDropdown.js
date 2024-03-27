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
      case 'Newest First':
        return arr.slice().sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
      case 'Oldest First':
        return arr.slice().sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
      case 'Most Words':
        return arr.slice().sort((a, b) => b.num_of_words - a.num_of_words)
      case 'Least Words':
        return arr.slice().sort((a, b) => a.num_of_words - b.num_of_words)
      case 'Longest Time':
        return arr.slice().sort((a, b) => b.total_time_taken - a.total_time_taken)
      case 'Shortest Time':
        return arr.slice().sort((a, b) => a.total_time_taken - b.total_time_taken)
      case 'Fastest WPM':
        return arr.slice().sort((a, b) => b.wpm - a.wpm)
      case 'Slowest WPM':
        return arr.slice().sort((a, b) => a.wpm - b.wpm)
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
