import React from 'react'

import styles from './Tag.module.scss'
export const Tag = ({ name, ...rest }) => {
  return (
    <div {...rest} className={styles.wrapper}>
      {name}
    </div>
  )
}

export default Tag
