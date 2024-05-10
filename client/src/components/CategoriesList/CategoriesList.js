import React, { useState, useEffect } from 'react'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import { setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'

import styles from './CategoriesList.module.scss'

const CategoriesList = () => {
  const dispatch = useDispatch()

  const { allCategories } = useSelector((state) => state.categories)
  console.log('allCategories is:')
  console.log(allCategories)
  return (
    <ul className={styles.wrapper}>
      {allCategories.map((category) => (
        <TextButton onClick={() => dispatch(setCurrentCategory(category))}>{category.name}</TextButton>
      ))}
    </ul>
  )
}

export default CategoriesList
