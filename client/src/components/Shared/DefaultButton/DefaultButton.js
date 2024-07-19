import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import styles from './DefaultButton.module.scss'

const DefaultButton = ({ tooltip, className, children, isSelected, ...props }) => {
  return (
    <button
      {...props}
      // data-tooltip-id="main-tooltip"
      // data-tooltip-content={props.disabled ? 'button disabled' : tooltip}
      className={classNames(styles.wrapper, className, { [styles.selected]: isSelected })}
    >
      {children}
    </button>
  )
}

DefaultButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  tooltip: PropTypes.string,
  isSelected: PropTypes.bool,
}

export default DefaultButton
