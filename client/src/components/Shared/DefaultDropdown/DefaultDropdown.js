import React from 'react'
import classNames from 'classnames'

import styles from './DefaultDropdown.module.scss'

const DefaultDropdown = ({ className, options, value, onChange, placeholder, tooltip }) => {
  return (
    <select
      data-tooltip-id="main-tooltip"
      data-tooltip-content={tooltip}
      className={classNames(styles.wrapper, className)}
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
