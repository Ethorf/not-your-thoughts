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
  console.log('customPrompts is:')
  console.log(customPrompts)
  return (
    <>
      {customPrompts.length ? (
        <ul className={styles.promptsList}>
          {customPrompts.map((prompt) => (
            <li className={styles.listedPrompt} key={prompt.id}>
              <h4>{prompt.content}</h4>
              <TextButton tooltip="delete prompt" onClick={() => handleDeletePrompt(prompt.id)}>
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
