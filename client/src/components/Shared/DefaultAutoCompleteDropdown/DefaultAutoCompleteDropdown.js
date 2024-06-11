import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import TextButton from '@components/Shared/TextButton/TextButton.js'

import styles from './DefaultAutoCompleteDropdown.module.scss'

const DefaultAutoCompleteDropdown = ({ inputValue, options, className, placeholder, onChange }) => {
  const [filteredOptions, setFilteredOptions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)

  const handleInputChange = (event) => {
    const value = event.target.value
    filterOptions(value)
    onChange && onChange(event.target.value)
    setShowDropdown(value !== '')
  }

  const filterOptions = (value) => {
    const filtered = options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (value) => {
    onChange && onChange(value)
    setFilteredOptions([])
    setShowDropdown(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && filteredOptions.length > 0) {
      event.preventDefault()
      handleOptionSelect(filteredOptions[0])
      inputRef.current.focus()
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
            <TextButton className={classNames(styles.option)} key={index} onClick={() => handleOptionSelect(option)}>
              {option}
            </TextButton>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DefaultAutoCompleteDropdown
