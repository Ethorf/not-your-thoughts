import React from 'react'
import classNames from 'classnames'
import styles from './DefaultButton.module.scss'

const DefaultButton = React.forwardRef(({ tooltip, className, children, isSelected, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      data-tooltip-id="main-tooltip"
      data-tooltip-content={props.disabled ? 'button disabled' : tooltip}
      className={classNames(styles.wrapper, { [styles.selected]: isSelected }, className)}
    >
      {children}
    </button>
  )
})

DefaultButton.displayName = 'DefaultButton'

export default DefaultButton
