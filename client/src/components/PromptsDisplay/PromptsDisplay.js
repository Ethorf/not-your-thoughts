import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomPrompts } from '../../redux/reducers/customPromptsReducer'
import DefaultButton from '../Shared/DefaultButton/DefaultButton'

import styles from './PromptsDisplay.module.scss'

const PromptsDisplay = () => {
  const dispatch = useDispatch()
  const [activePromptIndex, setActivePromptIndex] = useState(0)

  const { customPrompts } = useSelector((state) => state.customPrompts)

  useEffect(() => {
    dispatch(fetchCustomPrompts())
  }, [dispatch])

  //   TODO - Add a + thing once we modalfy this
  return (
    customPrompts.length && (
      <div className={styles.wrapper}>
        <DefaultButton disabled={activePromptIndex === 0} onClick={() => setActivePromptIndex(0)}>
          First
        </DefaultButton>
        <DefaultButton disabled={activePromptIndex === 0} onClick={() => setActivePromptIndex(activePromptIndex - 1)}>
          Prev
        </DefaultButton>
        <h3 className={styles.prompt}>{customPrompts[activePromptIndex].content}</h3>
        <DefaultButton
          disabled={activePromptIndex === customPrompts.length - 1}
          onClick={() => setActivePromptIndex(activePromptIndex + 1)}
        >
          Next
        </DefaultButton>
        <DefaultButton
          disabled={activePromptIndex === customPrompts.length - 1}
          onClick={() => setActivePromptIndex(customPrompts.length - 1)}
        >
          Last
        </DefaultButton>
      </div>
    )
  )
}

export default PromptsDisplay
