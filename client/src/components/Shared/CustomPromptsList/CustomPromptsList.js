import React from 'react'
import useCustomPrompts from '../../../hooks/useCustomPrompts'

import { CustomPrompt } from '../CustomPrompt/CustomPrompt'

import styles from './CustomPromptsList.module.scss' // Import your CSS module styles

export const CustomPromptsList = () => {
  const { customPrompts } = useCustomPrompts()

  return (
    <>
      {customPrompts.length ? (
        <ul className={styles.promptsList}>
          {customPrompts.map((prompt) => (
            <CustomPrompt prompt={prompt} />
          ))}
        </ul>
      ) : (
        <h3>No prompts created yet...</h3>
      )}
    </>
  )
}
