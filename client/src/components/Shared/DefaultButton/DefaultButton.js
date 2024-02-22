import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import styles from './DefaultButton.module.scss'

const DefaultButton = ({ className, children, ...props }) => {
  return (
    <button {...props} className={classNames(styles.wrapper, className)}>
      {children}
    </button>
  )
}

DefaultButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default DefaultButton
