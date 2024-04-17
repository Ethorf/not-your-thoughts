import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { PROMPT_STATUSES } from '../../../constants/promptStatuses'

// Redux
import {
  deleteCustomPrompt,
  updatePromptStatus,
  togglePromptStarred,
} from '../../../redux/reducers/customPromptsReducer'
import { setTitle } from '../../../redux/reducers/currentEntryReducer'

import useNodeEntriesInfo from '../../../hooks/useNodeEntriesInfo'

// Components
import TextButton from '../TextButton/TextButton'
import DefaultDropdown from '../DefaultDropdown/DefaultDropdown'
import { FavStarIcon } from '../FavStarIcon/FavStarIcon'

import styles from './CustomPrompt.module.scss'

export const CustomPrompt = ({ prompt: { id, content, status, starred } }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const [selectedStatus, setSelectedStatus] = useState(status)
  const [isStarred, setIsStarred] = useState(starred)

  const handleDeletePrompt = (promptId) => {
    dispatch(deleteCustomPrompt(promptId))
  }

  const handleUpdatePromptStatus = (e) => {
    setSelectedStatus(e.target.value)
    dispatch(updatePromptStatus({ promptId: id, status: e.target.value }))
  }
  const handleTogglePromptStarred = () => {
    setIsStarred(() => !isStarred)
    dispatch(togglePromptStarred(id))
  }

  const CONTENT_ELLIPSIS_CUTTOFF_LENGTH = 20

  function hasTitle(arrayOfObjects, targetTitle) {
    for (let obj of arrayOfObjects) {
      if (obj.title.toLowerCase() === targetTitle.toLowerCase()) {
        return obj.id
      }
    }
    return null
  }
  const handlePromptClick = async () => {
    const nodeId = hasTitle(nodeEntriesInfo, content)

    if (nodeId) {
      console.log('title found')
      history.push(`/edit-node-entry?entryId=${nodeId}`)
    } else {
      await dispatch(setTitle(content))
      history.push(`/create-node-entry`)
      console.log('no title found')
    }
  }

  return (
    <li className={styles.wrapper} key={id}>
      <FavStarIcon
        onClick={handleTogglePromptStarred}
        starred={starred}
        className={classNames(styles.favStarIcon, { [styles.starred]: isStarred })}
      />
      <h3 onClick={handlePromptClick} className={styles.content}>
        {content.slice(0, CONTENT_ELLIPSIS_CUTTOFF_LENGTH)}
        {content.length > CONTENT_ELLIPSIS_CUTTOFF_LENGTH && '...'}
      </h3>
      <DefaultDropdown
        value={selectedStatus}
        options={Object.values(PROMPT_STATUSES)}
        onChange={handleUpdatePromptStatus}
        tooltip={'Change prompt status'}
      />
      <TextButton className={styles.deleteButton} tooltip="delete" onClick={() => handleDeletePrompt(id)}>
        X
      </TextButton>
    </li>
  )
}
