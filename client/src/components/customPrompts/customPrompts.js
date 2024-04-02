import React from 'react'
import { useDispatch } from 'react-redux'
import { openModal } from '../../redux/reducers/modalsReducer.js'

import { MODAL_NAMES } from '../../constants/modalNames.js'

import DefaultButton from '../Shared/DefaultButton/DefaultButton.js'

import styles from './CustomPrompts.module.scss'

const CustomPrompts = () => {
  const dispatch = useDispatch()

  const handleOpenModal = () => {
    dispatch(openModal(MODAL_NAMES.CUSTOM_PROMPTS))
  }

  return (
    <div className={styles.wrapper}>
      <h2>Custom Prompts</h2>
      {/* Toggle here */}
      {/* TODO maybe just change everything to an "entry_config" instead of journal config? */}
      <DefaultButton onClick={handleOpenModal}>Add</DefaultButton>
    </div>
  )
}

export default CustomPrompts
