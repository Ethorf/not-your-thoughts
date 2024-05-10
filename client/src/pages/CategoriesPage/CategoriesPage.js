import React, { useState, useEffect } from 'react'

import { ENTRY_TYPES } from '@constants/entryTypes.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import CategoriesList from '@components/CategoriesList/CategoriesList.js'
import CurrentCategoryDisplay from '@components/CurrentCategoryDisplay/CurrentCategoryDisplay.js'

import { fetchCategories, setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'

import styles from './CategoriesPage.module.scss'

const CategoriesPage = () => {
  const [showAllCategories, setShowAllCategories] = useState(true)

  const dispatch = useDispatch()
  //   Could use currentCategory as this?
  const { allCategories, currentCategory } = useSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [])

  return (
    <div className={styles.wrapper}>
      {currentCategory ? (
        <TextButton onClick={() => dispatch(setCurrentCategory(null))}>Back to all</TextButton>
      ) : (
        <h1 className={styles.header}>All Categories</h1>
      )}
      {currentCategory ? (
        <CurrentCategoryDisplay />
      ) : allCategories.length ? (
        <CategoriesList />
      ) : (
        <h3>No categories yet</h3>
      )}
    </div>
  )
}

export default CategoriesPage
