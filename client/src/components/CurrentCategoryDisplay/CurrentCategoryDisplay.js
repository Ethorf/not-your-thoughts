import React, { useState, useEffect } from 'react'

import { ENTRY_TYPES } from '@constants/entryTypes.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'
import CategoryInput from '@components/CategoryInput/CategoryInput'

import { setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'

import styles from './CurrentCategoryDisplay.module.scss'

const CurrentCategoryDisplay = () => {
  const dispatch = useDispatch()

  const {
    currentCategory: { name, parent_category, child_categories, linked_entry },
  } = useSelector((state) => state.categories)

  return (
    <div className={styles.wrapper}>
      <CategoryInput />
      <h3>{parent_category ? parent_category.name : 'no parent category yet'}</h3>
      <h2 className={styles.name}>{name}</h2>
      {child_categories?.length ? <ul></ul> : 'no child categories yet'}
    </div>
  )
}

export default CurrentCategoryDisplay
