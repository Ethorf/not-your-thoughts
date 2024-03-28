import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomPrompts, createCustomPrompt, deleteCustomPrompt } from '../../redux/reducers/customPromptsReducer'
import DefaultButton from '../Shared/DefaultButton/DefaultButton'
import DefaultInput from '../Shared/DefaultInput/DefaultInput'

import styles from './CustomPrompts.module.scss'

const CustomPrompts = () => {
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
    <div>
      <h2>Custom Prompts</h2>
      <div className={styles.promptInput}>
        <DefaultInput
          value={customPromptInput}
          onChange={(e) => setCustomPromptInput(e.target.value)}
          placeholder="input custom prompt..."
        />
        <DefaultButton onClick={handleCreatePrompt}>Create New Prompt</DefaultButton>
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
  )
}

export default CustomPrompts
