import React from 'react'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import CategoriesList from '@components/CategoriesList/CategoriesList.js'
import CurrentCategoryDisplay from '@components/CurrentCategoryDisplay/CurrentCategoryDisplay.js'
import Spinner from '@components/Shared/Spinner/Spinner'

import { setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'
import useCategories from '@hooks/useCategories'

import styles from './CategoriesPage.module.scss'

const CategoriesPage = () => {
  const dispatch = useDispatch()
  const { currentCategory, loading } = useSelector((state) => state.categories)
  const { allCategories } = useCategories()

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
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
      )}
    </>
  )
}

export default CategoriesPage
