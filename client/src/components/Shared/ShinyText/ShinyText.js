import classNames from 'classnames'
import React from 'react'
import styles from './ShinyText.module.scss'

const ShinyText = ({ text, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`

  return (
    <span className={classNames(styles.shinyText, className)} style={{ animationDuration }}>
      {text}
    </span>
  )
}

export default ShinyText
