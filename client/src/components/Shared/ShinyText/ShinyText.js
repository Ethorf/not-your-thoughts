import classNames from 'classnames'
import React, { forwardRef } from 'react'
import styles from './ShinyText.module.scss'

const ShinyText = forwardRef(({ text, speed = 5, className = '', ...rest }, ref) => {
  const animationDuration = `${speed}s`

  return (
    <span
      ref={ref}
      className={classNames(styles.shinyText, className)}
      style={{ animationDuration }}
      {...rest}
    >
      {text}
    </span>
  )
})

ShinyText.displayName = 'ShinyText'

export default ShinyText
