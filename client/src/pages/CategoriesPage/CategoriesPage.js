import React, { useState, useEffect } from 'react'

import { ENTRY_TYPES } from '@constants/entryTypes.js'

import CategoriesList from '@components/CategoriesList/CategoriesList.js'
import { fetchCategories } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'

import styles from './CategoriesPage.module.scss'

const { NODE, JOURNAL } = ENTRY_TYPES

const CategoriesPage = () => {
  const [showAllCategories, setShowAllCategories] = useState(true)

  const dispatch = useDispatch()
  const { allCategories, currentCategory } = useSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [])

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>Categories</h1>
      {allCategories.length ? <CategoriesList /> : <h3>No categories yet</h3>}
    </div>
  )
}

export default CategoriesPage
