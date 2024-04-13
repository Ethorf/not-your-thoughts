import React from 'react'
import TextButton from '../TextButton/TextButton'
import { useDispatch } from 'react-redux'
import useCustomPrompts from '../../../hooks/useCustomPrompts'
import styles from './CustomPromptsList.module.scss' // Import your CSS module styles

import { deleteCustomPrompt } from '../../../redux/reducers/customPromptsReducer'

export const CustomPromptsList = () => {
  const dispatch = useDispatch()
  const { customPrompts } = useCustomPrompts()

  const handleDeletePrompt = (promptId) => {
    dispatch(deleteCustomPrompt(promptId))
  }

  return (
    <>
      {customPrompts.length ? (
        <ul className={styles.promptsList}>
          {customPrompts.map((prompt) => (
            <li className={styles.promptWrapper} key={prompt.id}>
              <h4 className={styles.promptContent}>{prompt.content}</h4>
              <TextButton
                className={styles.deleteButton}
                tooltip="delete prompt"
                onClick={() => handleDeletePrompt(prompt.id)}
              >
                X
              </TextButton>
            </li>
          ))}
        </ul>
      ) : (
        <h3>No prompts created yet...</h3>
      )}
    </>
  )
}
