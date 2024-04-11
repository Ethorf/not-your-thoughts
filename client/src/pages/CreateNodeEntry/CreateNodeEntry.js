import React, { useEffect } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { setTitle, createNodeEntry, resetState } from '../../redux/reducers/currentEntryReducer'

import CreateEntry from '../../components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'
import DefaultInput from '../../components/Shared/DefaultInput/DefaultInput'
import PromptsDisplay from '../../components/PromptsDisplay/PromptsDisplay.js'

import { ENTRY_TYPES } from '../../constants/entryTypes'

import styles from './CreateNodeEntry.module.scss'
import CategoryInput from '../../components/CategoryInput/CategoryInput'
import TagsInput from '../../components/TagsInput/TagsInput'

const CreateNodeEntry = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { wordCount, content, title, category, tags } = useSelector((state) => state.currentEntry)

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  useEffect(() => {
    dispatch(resetState())
  }, [dispatch])

  const handleSaveNode = async () => {
    const newNode = await dispatch(createNodeEntry({ content, category, title, tags }))
    // TODO fix this
    // history.push(`/edit-node-entry?entryId=${newNode.payload.id}`)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.editContainer}>
        <h2>create node</h2>
        <PromptsDisplay />
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
            <DefaultButton disabled={!content.length} onClick={handleSaveNode} className={styles.saveButton}>
              Save Node
            </DefaultButton>
          </span>
        </div>
      </div>
    </div>
  )
}

export default CreateNodeEntry
