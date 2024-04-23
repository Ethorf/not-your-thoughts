import React from 'react'
import { CustomPrompt } from '../CustomPrompt/CustomPrompt'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import useCustomPrompts from '@hooks/useCustomPrompts'

import styles from './CustomPromptsList.module.scss'

export const CustomPromptsList = () => {
  const { customPrompts } = useCustomPrompts()
  const nodeEntriesInfo = useNodeEntriesInfo()

  // Sort custom prompts with starred prompts first
  const sortedPrompts = [...customPrompts].sort((a, b) => {
    if (a.starred && !b.starred) return -1 // a comes first if it's starred
    if (!a.starred && b.starred) return 1 // b comes first if a is not starred but b is
    return 0 // maintain the order for non-starred prompts
  })

  return (
    <>
      {sortedPrompts.length ? (
        <ul className={styles.promptsList}>
          {sortedPrompts.map((prompt) => (
            <CustomPrompt nodeEntriesInfo={nodeEntriesInfo} key={prompt.id} prompt={prompt} />
          ))}
        </ul>
      ) : (
        <h3>No prompts created yet...</h3>
      )}
    </>
  )
}
