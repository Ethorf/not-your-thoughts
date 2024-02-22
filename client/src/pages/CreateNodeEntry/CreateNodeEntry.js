import React from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { setTitle, createNodeEntry, updateNodeEntry } from '../../redux/reducers/currentEntryReducer'

import CreateEntry from '../../components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'
import DefaultInput from '../../components/Shared/DefaultInput/DefaultInput'

import styles from './CreateNodeEntry.module.scss'

const CreateNodeEntry = () => {
  const dispatch = useDispatch()
  const { entryId, content, title } = useSelector((state) => state.currentEntry)

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleSaveNode = () => {
    if (entryId === null) {
      dispatch(createNodeEntry({ content, category: '', title, tags: [] }))
    } else {
      dispatch(updateNodeEntry({ entryId, content, category: '', title, tags: [] }))
    }
  }
  console.log('entryId is:')
  console.log(entryId)
  return (
    <div className={styles.wrapper}>
      <h2>create node</h2>
      <div>
        <DefaultInput
          className={classNames(styles.titleInput, { [styles.titleInputNoBorder]: title.length })}
          placeholder={'Enter Title'}
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <CreateEntry />
      <DefaultButton disabled={!content.length} onClick={handleSaveNode} className={styles.saveButton}>
        Save Node
      </DefaultButton>
    </div>
  )
}

export default CreateNodeEntry
