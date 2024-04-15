import React, { useState } from 'react'
import TextButton from '../TextButton/TextButton'
import { useDispatch } from 'react-redux'

import { PROMPT_STATUSES } from '../../../constants/promptStatuses'

import styles from './CustomPrompt.module.scss'
import {
  deleteCustomPrompt,
  updatePromptStatus,
  togglePromptStarred,
} from '../../../redux/reducers/customPromptsReducer'

export const CustomPrompt = ({ prompt: { id, content, status, starred } }) => {
  const dispatch = useDispatch()
  const [selectedStatus, setSelectedStatus] = useState(status)

  const handleDeletePrompt = (promptId) => {
    dispatch(deleteCustomPrompt(promptId))
  }

  const handleUpdatePromptStatus = (e) => {
    setSelectedStatus(e.target.value)
    dispatch(updatePromptStatus({ promptId: id, status: selectedStatus }))
  }
  const handleTogglePromptStarred = () => {
    dispatch(togglePromptStarred(id))
  }

  console.log('status is:')
  console.log(status)

  return (
    <li className={styles.wrapper} key={id}>
      <select id="promptStatus" value={selectedStatus} onChange={handleUpdatePromptStatus}>
        <option value="">Select Status</option>
        {Object.values(PROMPT_STATUSES).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <TextButton className={styles.deleteButton} tooltip="toggle starred" onClick={handleTogglePromptStarred}>
        Fav
      </TextButton>
      <h4 className={styles.content}>{content}</h4>
      <TextButton className={styles.deleteButton} tooltip="delete prompt" onClick={() => handleDeletePrompt(id)}>
        X
      </TextButton>
    </li>
  )
}
