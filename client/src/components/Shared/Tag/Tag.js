import React from 'react'

import styles from './Tag.module.scss'
export const Tag = ({ name }) => {
  return <div className={styles.wrapper}>{name}</div>
}

export default Tag
