// Packages
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '../../../constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '../../Shared/DefaultButton/DefaultButton'
import Tag from '../../Shared/Tag/Tag'
import DefaultInput from '../../Shared/DefaultInput/DefaultInput'
import DefaultAutoCompleteInput from '../../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

// Redux
import { setTags, setTagInput, fetchTags } from '../../../redux/reducers/currentEntryReducer.js'

import styles from './TagsInputModal.module.scss'

export const TagsInputModal = () => {
  const dispatch = useDispatch()
  const [options, setOptions] = useState([])

  const { tagInput, tags } = useSelector((state) => state.currentEntry)

  useEffect(() => {
    dispatch(fetchTags()).then((response) => {
      const tags = response.payload.map((category) => category.name)
      setOptions(tags)
    })
  }, [dispatch])

  const handleAddTags = () => {
    dispatch(setTags(tagInput))
    dispatch(setTagInput(''))
  }
  const handleTagChange = (tag) => {
    dispatch(setTagInput(tag))
  }

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.TAGS_INPUT}>
      <div className={styles.wrapper}>
        <h2>Tags</h2>
        <div className={styles.currentTagsContainer}>
          <p className={styles.tagsLabel}>Tags:</p>
          {tags.map((tag, idx) => (
            <Tag key={idx} name={tag} />
          ))}
          {tags.length > 3 && <span className={styles.tagsElipsis}>...</span>}
        </div>
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
      </div>
    </BaseModalWrapper>
  )
}
