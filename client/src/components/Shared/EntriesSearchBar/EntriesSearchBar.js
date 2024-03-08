import React, { useState } from 'react'
import styles from './EntriesSearchBar.module.scss'

export const EntriesSearchBar = ({ data, setFilteredEntries }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    const searchTerm = e.target.value
    setSearchTerm(searchTerm)

    if (searchTerm.trim() === '') {
      // If search term is empty, reset filtered entries to the original data
      setFilteredEntries(data)
    } else {
      // Filter the data based on the search term
      const filteredData = data.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredEntries(filteredData)
    }
  }

  return (
    <div>
      <input className={styles.input} type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
    </div>
  )
}
