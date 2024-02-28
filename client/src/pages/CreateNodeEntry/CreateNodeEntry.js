import React, { useEffect } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import { setTitle, createNodeEntry, updateNodeEntry, setEntryById } from '../../redux/reducers/currentEntryReducer'

import CreateEntry from '../../components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'
import DefaultInput from '../../components/Shared/DefaultInput/DefaultInput'

import styles from './CreateNodeEntry.module.scss'
import CategoryInput from '../../components/CategoryInput/CategoryInput'
import TagsInput from '../../components/TagsInput/TagsInput'

const CreateNodeEntry = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()
  const { entryId, content, title, category, tags } = useSelector((state) => state.currentEntry)

  // Effect to update entryId query param in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (entryId && !params.has('entryId')) {
      params.append('entryId', entryId)
      history.push({ search: params.toString() })
    }
  }, [entryId, history, location.search])

  // Effect to dispatch setEntryById if entryId query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const entryIdParam = params.get('entryId')
    if (entryIdParam) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, location.search])

  const handleTitleChange = (e) => {
    dispatch(setTitle(e.target.value))
  }

  const handleSaveNode = () => {
    if (entryId === null) {
      dispatch(createNodeEntry({ content, category, title, tags }))
    } else {
      dispatch(updateNodeEntry({ entryId, content, category, title, tags }))
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.editContainer}>
        <h2>create node</h2>
        <div className={styles.topContainer}>
          <CategoryInput />
          <DefaultInput
            className={classNames(styles.titleInput, { [styles.titleInputNoBorder]: title.length })}
            placeholder={'Enter Title'}
            value={title}
            onChange={handleTitleChange}
          />
          <TagsInput />
        </div>
        <CreateEntry />
        <DefaultButton disabled={!content.length} onClick={handleSaveNode} className={styles.saveButton}>
          Save Node
        </DefaultButton>
      </div>
    </div>
  )
}

export default CreateNodeEntry
