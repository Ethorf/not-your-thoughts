// Packages
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '../../../constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '../../Shared/DefaultButton/DefaultButton'
import DefaultInput from '../../Shared/DefaultInput/DefaultInput'
import { CustomPromptsList } from '../../Shared/CustomPromptsList/CustomPromptsList'

// Redux
import { fetchCustomPrompts, createCustomPrompt } from '../../../redux/reducers/customPromptsReducer'

import styles from './CustomPromptsModal.module.scss'

export const CustomPromptsModal = () => {
  const dispatch = useDispatch()
  const [customPromptInput, setCustomPromptInput] = useState('')

  useEffect(() => {
    dispatch(fetchCustomPrompts())
  }, [dispatch])

  const handleCreatePrompt = () => {
    if (customPromptInput.trim() !== '') {
      dispatch(createCustomPrompt(customPromptInput))
      setCustomPromptInput('')
    }
  }

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.CUSTOM_PROMPTS}>
      <div className={styles.wrapper}>
        <h2>Custom Prompts</h2>
        <div className={styles.promptInput}>
          <DefaultInput
            value={customPromptInput}
            onChange={(e) => setCustomPromptInput(e.target.value)}
            placeholder="input custom prompt..."
          />
          <DefaultButton onClick={handleCreatePrompt}>Create</DefaultButton>
        </div>
        <CustomPromptsList />
      </div>
    </BaseModalWrapper>
  )
}
