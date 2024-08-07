import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import classNames from 'classnames'
import TextButton from '@components/Shared/TextButton/TextButton.js'

import styles from './DefaultAutoCompleteDropdown.module.scss'

const DefaultAutoCompleteDropdown = ({
  inputValue,
  setInputValue,
  options,
  className,
  placeholder,
  onChange,
  onSubmit,
  handleTargetInput,
  insideSidebar,
}) => {
  const { sidebarOpen } = useSelector((state) => state.sidebar)

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
    setHighlightedIndex(0)
  }

  const filterOptions = (value) => {
    const filtered = options.filter((option) => option?.toLowerCase().includes(value?.toLowerCase()))
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = async (value) => {
    setInputValue(value)
    onChange && onChange(value)
    setFilteredOptions([])
    setShowDropdown(false)
    return value
  }

  const handleKeyDown = async (event) => {
    if (filteredOptions.length > 0) {
      if (event.key === 'Enter') {
        event.preventDefault()
        const selectedOption = await handleOptionSelect(filteredOptions[highlightedIndex])
        onSubmit && (await onSubmit(selectedOption))
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
    } else if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit && onSubmit()
    }
  }

  const handleDropdownToggle = () => {
    if (filteredOptions.length === 0) {
      filterOptions(inputValue)
    }
    setShowDropdown(!showDropdown)
  }

  const handleDropdownOptionClick = async (opt) => {
    const selectedOption = await handleOptionSelect(opt)
    onSubmit && (await onSubmit(selectedOption))
  }

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e)
    window.addEventListener('keydown', handleKeyDownWrapper)
    return () => {
      window.removeEventListener('keydown', handleKeyDownWrapper)
    }
  }, [])

  useEffect(() => {
    if (handleTargetInput) {
      const handleTargetInputWrapper = (e) => handleTargetInput(e, inputRef)
      window.addEventListener('keydown', handleTargetInputWrapper)

      return () => {
        window.removeEventListener('keydown', handleTargetInputWrapper)
      }
    }
  }, [handleTargetInput])

  useEffect(() => {
    if (insideSidebar) {
      if (sidebarOpen) {
        handleTargetInput({}, inputRef)
      } else {
        if (inputRef.current) {
          inputRef.current.blur()
        }
      }
    }
  }, [sidebarOpen, insideSidebar, handleTargetInput])

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
          autoComplete="on"
          list="options"
          onKeyDown={handleKeyDown}
        />
        <TextButton
          className={classNames(styles.dropdownButton, { [styles.dropdownButtonOpen]: showDropdown })}
          onClick={handleDropdownToggle}
          tabIndex="-1"
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
              onClick={() => handleDropdownOptionClick(option)}
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
