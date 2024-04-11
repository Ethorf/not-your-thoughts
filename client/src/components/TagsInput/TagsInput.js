import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import { openModal } from '../../redux/reducers/modalsReducer.js'

import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'
import DefaultButton from '../Shared/DefaultButton/DefaultButton.js'
import TextButton from '../../components/Shared/TextButton/TextButton'

import { MODAL_NAMES } from '../../constants/modalNames'

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

  const handleOpenTagsModal = () => {
    dispatch(openModal(MODAL_NAMES.TAGS_INPUT))
  }

  return (
    <div className={classNames(className, styles.wrapper)}>
      <div className={styles.tagsContainer}>
        <TextButton className={styles.tagsInputSectionButton} onClick={handleOpenTagsModal}>
          +
        </TextButton>
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
