import React, { useState } from 'react'
import classNames from 'classnames'

import styles from './DefaultAutoCompleteInput.module.scss'

const AutoCompleteInput = ({ options, className, placeholder, onChange }) => {
  const [inputValue, setInputValue] = useState('')
  const [filteredOptions, setFilteredOptions] = useState([])

  // Handler for input change
  const handleInputChange = (event) => {
    const value = event.target.value
    setInputValue(value)
    filterOptions(value)
    onChange && onChange(event.target.value)
  }

  const filterOptions = (value) => {
    const filtered = options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (value) => {
    setInputValue(value)
    setFilteredOptions([])
  }

  return (
    <div>
      <input
        className={classNames(styles.wrapper, className)}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id="options">
        {filteredOptions.map((option, index) => (
          <option key={index} value={option} onClick={() => handleOptionSelect(option)} />
        ))}
      </datalist>
    </div>
  )
}

export default AutoCompleteInput
