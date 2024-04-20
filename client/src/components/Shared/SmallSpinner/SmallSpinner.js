import React from 'react'
import spinner from '../../../assets/Icons/loading-spinner-black.gif'

import styles from './SmallSpinner.module.scss'

export default function Spinner() {
  return (
    <div className={styles.wrapper}>
      <img className={styles.spinner} src={spinner} alt="Loading..." />
    </div>
  )
}
