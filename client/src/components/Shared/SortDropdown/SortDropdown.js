import React from 'react'

const SortDropdown = ({ options, onChange }) => {
  const handleSortChange = (event) => {
    const selectedOption = event.target.value
    onChange(selectedOption)
  }

  return (
    <select onChange={handleSortChange}>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default SortDropdown
