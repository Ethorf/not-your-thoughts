import classNames from 'classnames'
import React, { forwardRef } from 'react'

import { getShinyTextAnimationDelay } from '@utils/shinyTextAnimation'

import styles from './ShinyText.module.scss'

const ShinyText = forwardRef(({ text, speed = 5, className = '', animationId, ...rest }, ref) => {
  const animationDuration = `${speed}s`
  const animationDelay = getShinyTextAnimationDelay(animationId, speed)

  return (
    <span
      ref={ref}
      className={classNames(styles.shinyText, className)}
      style={{
        animationDuration,
        ...(animationDelay ? { animationDelay } : {}),
      }}
      {...rest}
    >
      {text}
    </span>
  )
})

ShinyText.displayName = 'ShinyText'

export default ShinyText
