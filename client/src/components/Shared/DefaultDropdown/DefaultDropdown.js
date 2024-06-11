import React from 'react'

import styles from './DefaultDropdown.module.scss'

const DefaultDropdown = ({ options, value, onChange, placeholder, tooltip }) => {
  return (
    <select
      data-tooltip-id="main-tooltip"
      data-tooltip-content={tooltip}
      className={styles.wrapper}
      value={value}
      onChange={onChange}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options &&
        options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
    </select>
  )
}

export default DefaultDropdown
