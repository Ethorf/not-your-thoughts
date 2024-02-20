import React from 'react'
import PropTypes from 'prop-types'
import styles from './DefaultButton.module.scss'

const DefaultButton = ({ onClick, children }) => {
  return (
    <button className={styles.wrapper} onClick={onClick}>
      {children}
    </button>
  )
}

DefaultButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

export default DefaultButton
