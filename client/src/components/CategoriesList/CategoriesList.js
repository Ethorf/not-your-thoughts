import React, { useState, useEffect } from 'react'

import { ENTRY_TYPES } from '@constants/entryTypes.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import { setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'

import styles from './CategoriesList.module.scss'

const { NODE, JOURNAL } = ENTRY_TYPES

const CategoriesList = () => {
  const [showAllCategories, setShowAllCategories] = useState(true)

  const dispatch = useDispatch()
  const { allCategories, currentCategory } = useSelector((state) => state.categories)

  return (
    <ul className={styles.wrapper}>
      {allCategories.map((category) => (
        <TextButton>{category.name}</TextButton>
      ))}
    </ul>
  )
}

export default CategoriesList
