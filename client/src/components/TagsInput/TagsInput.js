import React from 'react'
import classNames from 'classnames'

import { openModal } from '@redux/reducers/modalsReducer.js'

import TextButton from '@components/Shared/TextButton/TextButton'
import Tag from '@components/Shared/Tag/Tag'

import { MODAL_NAMES } from '@constants/modalNames'

import { useDispatch, useSelector } from 'react-redux'

import styles from './TagsInput.module.scss'
const TagsInput = ({ className }) => {
  const dispatch = useDispatch()
  const { tags } = useSelector((state) => state.currentEntry)

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
        {tags.slice(0, 3).map((tag, idx) => (
          <Tag key={idx} name={tag} />
        ))}
        {tags.length > 3 && <span className={styles.tagsElipsis}>...</span>}
      </div>
    </div>
  )
}

export default TagsInput
