import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'
import DefaultButton from '../Shared/DefaultButton/DefaultButton.js'

import { useDispatch, useSelector } from 'react-redux'
import { setTags, setTagInput, fetchTags } from '../../redux/reducers/currentEntryReducer.js'

import styles from './TagsInput.module.scss'
const TagsInput = ({ className }) => {
  const dispatch = useDispatch()
  const { tagInput, tags } = useSelector((state) => state.currentEntry)
  const [options, setOptions] = useState([])
  const [tagsInputVisible, setTagsInputVisible] = useState(false)

  useEffect(() => {
    dispatch(fetchTags()).then((response) => {
      const tags = response.payload.map((category) => category.name)
      setOptions(tags)
    })
  }, [dispatch])

  const handleTagChange = (tag) => {
    dispatch(setTagInput(tag))
  }

  const handleAddTags = () => {
    dispatch(setTags(tagInput))
    dispatch(setTagInput(''))
  }

  const Tag = ({ name }) => {
    return <div className={styles.tag}>{name}</div>
  }

  return (
    <div className={classNames(className, styles.wrapper)}>
      <div className={styles.tagsContainer}>
        <DefaultButton className={styles.tagsInputSectionButton} onClick={() => setTagsInputVisible(!tagsInputVisible)}>
          {!tagsInputVisible ? '+' : 'x'}
        </DefaultButton>
        <p className={styles.tagsLabel}>Tags:</p>
        {tags.slice(0, 3).map((tag) => (
          <Tag name={tag} />
        ))}
        {tags.length > 3 && <span className={styles.tagsElipsis}>...</span>}
      </div>
      {tagsInputVisible && (
        <div className={styles.tagsInputContainer}>
          <DefaultAutoCompleteInput
            inputValue={tagInput}
            onChange={handleTagChange}
            options={options}
            placeholder={'Add Tag Here'}
            className={styles.tagsInput}
          />
          <DefaultButton onClick={handleAddTags}>ADD</DefaultButton>
        </div>
      )}
    </div>
  )
}

export default TagsInput
