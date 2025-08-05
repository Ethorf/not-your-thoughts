import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import styles from './TextButton.module.scss'

const TextButton = ({ tooltip, className, children, isSelected, navLink, ...props }) => {
  return (
    <button
      {...props}
      data-tooltip-id="main-tooltip"
      data-tooltip-content={props.disabled ? 'button disabled' : tooltip}
      className={classNames(styles.wrapper, className, { [styles.selected]: isSelected, [styles.navLink]: navLink })}
    >
      {children}
    </button>
  )
}

TextButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  tooltip: PropTypes.string,
  isSelected: PropTypes.bool,
  navlink: PropTypes.bool,
}

export default TextButton
