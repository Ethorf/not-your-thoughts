import React from 'react'
import { useDispatch } from 'react-redux'
import { openModal } from '../../redux/reducers/modalsReducer.js'

import { MODAL_NAMES } from '../../constants/modalNames.js'

import TextButton from '../Shared/TextButton/TextButton.js'

import styles from './CustomPrompts.module.scss'

const CustomPrompts = () => {
  const dispatch = useDispatch()

  const handleOpenModal = () => {
    dispatch(openModal(MODAL_NAMES.CUSTOM_PROMPTS))
  }

  return (
    <div className={styles.wrapper}>
      <h2>Custom Prompts</h2>
      {/* Toggle here once we turn things into user_config */}
      <TextButton tooltip="add prompts" onClick={handleOpenModal}>
        +
      </TextButton>
    </div>
  )
}

export default CustomPrompts
