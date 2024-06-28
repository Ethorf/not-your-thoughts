import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import TextButton from '@components/Shared/TextButton/TextButton.js'

import styles from './DefaultAutoCompleteDropdown.module.scss'

const DefaultAutoCompleteDropdown = ({ inputValue, setInputValue, options, className, placeholder, onChange }) => {
  const [filteredOptions, setFilteredOptions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef(null)

  const handleInputChange = (event) => {
    const value = event.target.value

    setInputValue(value)
    filterOptions(value)
    onChange && onChange(value)
    setShowDropdown(value !== '')
    setHighlightedIndex(0) // Reset highlight to the first option
  }

  const filterOptions = (value) => {
    const filtered = options.filter((option) => option?.toLowerCase().includes(value?.toLowerCase()))
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (value) => {
    setInputValue(value)
    onChange && onChange(value)
    setFilteredOptions([])
    setShowDropdown(false)
  }

  const handleKeyDown = (event) => {
    if (filteredOptions.length > 0) {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleOptionSelect(filteredOptions[highlightedIndex])
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredOptions.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex((prevIndex) => (prevIndex - 1 + filteredOptions.length) % filteredOptions.length)
      } else if (event.key === 'Tab') {
        event.preventDefault()
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredOptions.length)
      }
    }
  }

  const handleDropdownToggle = () => {
    if (filteredOptions.length === 0) {
      filterOptions(inputValue)
    }
    setShowDropdown(!showDropdown)
  }

  return (
    <div className={classNames(styles.wrapper, className)}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          list="options"
          onKeyDown={handleKeyDown}
        />
        <TextButton
          className={classNames(styles.dropdownButton, { [styles.dropdownButtonOpen]: showDropdown })}
          onClick={handleDropdownToggle}
        >
          ▼
        </TextButton>
      </div>
      {showDropdown && filteredOptions.length > 0 && (
        <ul className={classNames(styles.dropdownList)}>
          {filteredOptions.map((option, index) => (
            <TextButton
              className={classNames(styles.option, { [styles.highlightedOption]: index === highlightedIndex })}
              key={index}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </TextButton>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DefaultAutoCompleteDropdown
