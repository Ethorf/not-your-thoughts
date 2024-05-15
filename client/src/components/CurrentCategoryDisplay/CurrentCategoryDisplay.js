import React, { useState } from 'react'

import TextButton from '@components/Shared/TextButton/TextButton.js'
import ParentCategoryInput from '@components/ParentCategoryInput/ParentCategoryInput'
import ChildCategoryInput from '@components/ChildCategoryInput/ChildCategoryInput'

import { setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import { useDispatch, useSelector } from 'react-redux'

import styles from './CurrentCategoryDisplay.module.scss'

const CurrentCategoryDisplay = () => {
  const dispatch = useDispatch()
  const [showAddParentCategory, setShowAddParentCategory] = useState(false)
  const [showAddChildCategory, setShowAddChildCategory] = useState(false)

  const {
    currentCategory: { name, parent_category, child_categories, linked_entry },
  } = useSelector((state) => state.categories)

  return (
    <div className={styles.wrapper}>
      <div className={styles.parentCategory}>
        {parent_category ? (
          <TextButton tooltip="Select parent category" onClick={() => dispatch(setCurrentCategory(parent_category))}>
            {parent_category.name}
          </TextButton>
        ) : (
          <h2>no parent category yet</h2>
        )}
        <TextButton tooltip="Add parent category" onClick={() => setShowAddParentCategory(!showAddParentCategory)}>
          {showAddParentCategory ? 'x' : '+'}
        </TextButton>
      </div>
      {showAddParentCategory ? <ParentCategoryInput className={styles.categoryInput} /> : null}
      <h2 className={styles.name}>{name}</h2>
      <TextButton tooltip="Add child category" onClick={() => setShowAddChildCategory(!showAddChildCategory)}>
        {showAddChildCategory ? 'x' : '+'}
      </TextButton>
      {showAddChildCategory ? <ChildCategoryInput className={styles.categoryInput} /> : null}
      {child_categories?.length ? (
        <ul>
          {child_categories.map((cat) => (
            <TextButton tooltip="Select category" onClick={() => dispatch(setCurrentCategory(cat))}>
              {cat.name}
            </TextButton>
          ))}
        </ul>
      ) : (
        'no child categories yet'
      )}
    </div>
  )
}

export default CurrentCategoryDisplay
