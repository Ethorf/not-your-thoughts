import React from 'react'
import classNames from 'classnames'

import styles from './HorizontalDivider.module.scss'

import { HORIZONTAL_DIVIDER_HEIGHTS } from '@constants/horizontalDividerHeights'

const { DEFAULT } = HORIZONTAL_DIVIDER_HEIGHTS

const HorizontalDivider = ({ className, height = DEFAULT }) => {
  return <hr className={classNames(styles.main, styles[height], className)} />
}

export default HorizontalDivider

HorizontalDivider.defaultProps = {
  className: '',
  height: DEFAULT,
}
