// Packages
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '../../../constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '../../Shared/DefaultButton/DefaultButton'
import DefaultInput from '../../Shared/DefaultInput/DefaultInput'

// Redux
import {
  fetchCustomPrompts,
  createCustomPrompt,
  deleteCustomPrompt,
} from '../../../redux/reducers/customPromptsReducer'

import styles from './CustomPromptsModal.module.scss'

export const CustomPromptsModal = () => {
  const dispatch = useDispatch()
  const [customPromptInput, setCustomPromptInput] = useState('')
  const { customPrompts } = useSelector((state) => state.customPrompts)

  useEffect(() => {
    dispatch(fetchCustomPrompts())
  }, [dispatch])

  const handleCreatePrompt = () => {
    if (customPromptInput.trim() !== '') {
      dispatch(createCustomPrompt(customPromptInput))
      setCustomPromptInput('')
    }
  }

  const handleDeletePrompt = (promptId) => {
    dispatch(deleteCustomPrompt(promptId))
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
        {customPrompts.length ? (
          <ul>
            {customPrompts.map((prompt) => (
              <li className={styles.listedPrompt} key={prompt.id}>
                <h4>{prompt.content}</h4>
                <DefaultButton onClick={() => handleDeletePrompt(prompt.id)}>X</DefaultButton>
              </li>
            ))}
          </ul>
        ) : (
          <h3>No prompts created yet...</h3>
        )}
      </div>
    </BaseModalWrapper>
  )
}
