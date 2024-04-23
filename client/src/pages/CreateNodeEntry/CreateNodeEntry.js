import React from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { setTitle, createNodeEntry } from '@redux/reducers/currentEntryReducer'

import { showToast } from '@utils/toast.js'

// Components
import AutosaveTimer from '@/components/Shared/AutosaveTimer/AutosaveTimer'
import CreateEntry from '@components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import DefaultInput from '@components/Shared/DefaultInput/DefaultInput'
import CustomPromptsSection from '@components/CustomPromptsSection/CustomPromptsSection.js'
import CategoryInput from '@components/CategoryInput/CategoryInput'
import TagsInput from '@components/TagsInput/TagsInput'

// Constants
import { ENTRY_TYPES } from '@constants/entryTypes'
import { SAVE_TYPES } from '@constants/saveTypes'

import styles from './CreateNodeEntry.module.scss'

const CreateNodeEntry = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { wordCount, content, title, category, tags, entriesLoading } = useSelector((state) => state.currentEntry)

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleCreateNode = async (saveType) => {
    try {
      const newNode = await dispatch(createNodeEntry({ content, category, title, tags, saveType }))
      const entryId = newNode?.payload?.id ?? null

      if (entryId) {
        history.push(`/edit-node-entry?entryId=${entryId}`)
      } else {
        showToast('Failed to retrieve node ID', 'error')
        console.error('Failed to retrieve node ID from response:', newNode)
      }
    } catch (error) {
      showToast('Error creating node entry', 'error')
      console.error('Error creating node entry:', error)
    }
  }

  return (
    <div className={styles.wrapper}>
      <AutosaveTimer handleAutosave={() => handleCreateNode(SAVE_TYPES.AUTO)} />
      <div className={styles.editContainer}>
        <h2>create node</h2>
        <CustomPromptsSection />
        <div className={classNames(styles.topContainer, styles.grid3Columns)}>
          <CategoryInput className={styles.flexStart} />
          <DefaultInput
            className={classNames(styles.titleInput, styles.flexCenter, { [styles.titleInputNoBorder]: title.length })}
            placeholder={'Enter Title'}
            value={title}
            onChange={handleTitleChange}
          />
          <TagsInput className={styles.flexEnd} />
        </div>
        <CreateEntry type={ENTRY_TYPES.NODE} />
        <div className={styles.grid3Columns}>
          <span className={styles.flexStart}>Words: {wordCount}</span>
          <span className={styles.flexCenter}></span>
          <span className={styles.flexEnd}>
            {entriesLoading ? (
              <SmallSpinner />
            ) : (
              <DefaultButton
                disabled={!content.length}
                onClick={() => handleCreateNode(SAVE_TYPES.MANUAL)}
                className={styles.saveButton}
              >
                Create Node
              </DefaultButton>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CreateNodeEntry
