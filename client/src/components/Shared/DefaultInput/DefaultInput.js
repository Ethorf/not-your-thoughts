import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import styles from './DefaultInput.module.scss'

const DefaultInput = ({ className, ...props }) => {
  return <input {...props} className={classNames(styles.wrapper, className)} />
}

DefaultInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default DefaultInput
