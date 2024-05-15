import React from 'react'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import { setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch } from 'react-redux'
import useCategories from '@hooks/useCategories'

import styles from './CategoriesList.module.scss'

const CategoriesList = () => {
  const dispatch = useDispatch()

  const { allCategories } = useCategories()

  return (
    <ul className={styles.wrapper}>
      {allCategories.map((category) => (
        <TextButton onClick={() => dispatch(setCurrentCategory(category))}>{category.name}</TextButton>
      ))}
    </ul>
  )
}

export default CategoriesList
