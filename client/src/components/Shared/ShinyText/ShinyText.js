import classNames from 'classnames'
import React from 'react'
import styles from './ShinyText.module.scss'

const ShinyText = ({ text, speed = 5, className = '', ...rest }) => {
  const animationDuration = `${speed}s`

  return (
    <span className={classNames(styles.shinyText, className)} style={{ animationDuration }} {...rest}>
      {text}
    </span>
  )
}

export default ShinyText
