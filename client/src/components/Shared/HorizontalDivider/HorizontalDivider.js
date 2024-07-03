import React from 'react'
import classNames from 'classnames'

import styles from './HorizontalDivider.module.scss'

const HorizontalDivider = ({ className }) => {
  return <hr className={classNames(styles.main, className)} />
}

export default HorizontalDivider
