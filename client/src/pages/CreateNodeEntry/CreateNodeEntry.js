import React, { useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
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
  const { wordCount, entryId, content, title, category, tags } = useSelector((state) => state.currentEntry)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  // Effect to update entryId query param in URL
  useEffect(() => {
    if (entryId && !params.has('entryId')) {
      params.append('entryId', entryId)
      history.push({ search: params.toString() })
    }
  }, [entryId, history, params])

  // Effect to dispatch setEntryById if entryId query param exists
  useEffect(() => {
    const entryIdParam = params.get('entryId')
    if (entryIdParam) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, params])

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

  //   This shit don't work
  const handleNewNode = () => {
    const newSearchParams = new URLSearchParams(history.location.search)
    newSearchParams.delete('entryId')
    history.push({ ...history.location, search: newSearchParams.toString() })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.editContainer}>
        <h2>create node</h2>
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
        <CreateEntry />
        <div className={styles.grid3Columns}>
          <span className={styles.flexStart}>Words: {wordCount}</span>
          <span className={styles.flexCenter}>
            <DefaultButton disabled={!params.has('entryId')} onClick={handleNewNode} className={styles.saveButton}>
              New Node
            </DefaultButton>
          </span>
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
