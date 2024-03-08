import React, { useState, useEffect } from 'react'
import styles from './EntriesSearchBar.module.scss'

export const EntriesSearchBar = ({ data, setFilteredEntries }) => {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setFilteredEntries(data)
  }, [data, setFilteredEntries])

  const handleSearch = (e) => {
    const searchTerm = e.target.value
    setSearchTerm(searchTerm)

    if (searchTerm.trim() === '') {
      // If search term is empty, set back to original data
      setFilteredEntries(data)
    } else {
      const filteredData = data.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.content[0] && item.content[0].toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredEntries(filteredData)
    }
  }

  return (
    <div>
      <input className={styles.input} type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
    </div>
  )
}
