import React, { forwardRef } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import styles from './DefaultInput.module.scss'

const DefaultInput = forwardRef(({ className, ...props }, ref) => {
  return <input ref={ref} {...props} className={classNames(styles.wrapper, className)} />
})

DefaultInput.displayName = 'DefaultInput'

DefaultInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
}

export default DefaultInput
