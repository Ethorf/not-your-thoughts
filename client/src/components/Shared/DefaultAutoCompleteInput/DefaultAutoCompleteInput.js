import React, { useState, useRef } from 'react'
import classNames from 'classnames'

import styles from './DefaultAutoCompleteInput.module.scss'

const AutoCompleteInput = ({ inputValue, options, className, placeholder, onChange }) => {
  const [filteredOptions, setFilteredOptions] = useState([])
  const inputRef = useRef(null)

  const handleInputChange = (event) => {
    const value = event.target.value
    filterOptions(value)
    onChange && onChange(event.target.value)
  }

  const filterOptions = (value) => {
    const filtered = options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (value) => {
    onChange && onChange(value)
    setFilteredOptions([])
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && filteredOptions.length > 0) {
      event.preventDefault()
      handleOptionSelect(filteredOptions[0])
      inputRef.current.focus()
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        className={classNames(styles.wrapper, className)}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="on"
        list="options"
        onKeyDown={handleKeyDown}
      />
      <datalist className={classNames(styles.optionsList)} id="options">
        {filteredOptions.map((option, index) => (
          <option
            className={classNames(styles.option)}
            key={index}
            value={option}
            onClick={() => handleOptionSelect(option)}
          />
        ))}
      </datalist>
    </div>
  )
}

export default AutoCompleteInput
