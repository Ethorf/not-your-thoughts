import React from 'react'
import { useDispatch } from 'react-redux'
import { openModal } from '@redux/reducers/modalsReducer.js'

import { MODAL_NAMES } from '@constants/modalNames.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import styles from './CustomPromptsSection.module.scss'

const CustomPromptsSection = () => {
  const dispatch = useDispatch()

  const handleOpenModal = () => {
    dispatch(openModal(MODAL_NAMES.CUSTOM_PROMPTS))
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.header}>Custom Prompts</h2>
      <TextButton tooltip="add prompts" onClick={handleOpenModal}>
        +
      </TextButton>
    </div>
  )
}

export default CustomPromptsSection
