import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'

import { PROMPT_STATUSES } from '../../../constants/promptStatuses'

import {
  deleteCustomPrompt,
  updatePromptStatus,
  togglePromptStarred,
} from '../../../redux/reducers/customPromptsReducer'

import TextButton from '../TextButton/TextButton'
import { FavStarIcon } from '../FavStarIcon/FavStarIcon'

import styles from './CustomPrompt.module.scss'

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

  return (
    <li className={styles.wrapper} key={id}>
      <FavStarIcon
        onClick={handleTogglePromptStarred}
        starred={starred}
        className={classNames(styles.favStarIcon, { [styles.starred]: starred })}
      />
      <h4 className={styles.content}>{content}</h4>
      <select id="promptStatus" value={selectedStatus} onChange={handleUpdatePromptStatus}>
        <option value="">Select Status</option>
        {Object.values(PROMPT_STATUSES).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <TextButton className={styles.deleteButton} tooltip="delete prompt" onClick={() => handleDeletePrompt(id)}>
        X
      </TextButton>
    </li>
  )
}
