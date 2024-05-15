import React, { useState } from 'react'

import TextButton from '@components/Shared/TextButton/TextButton.js'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

import { useDispatch, useSelector } from 'react-redux'

import { createCategory, updateChildCategories, setCurrentCategory } from '@redux/reducers/categoriesReducer.js'
import useCategories from '@hooks/useCategories'

const ChildCategoryInput = ({ className }) => {
  const dispatch = useDispatch()
  const { allCategories } = useCategories()
  const { currentCategory } = useSelector((state) => state.categories)
  const categoryNames = allCategories.map((cat) => cat.name.toLowerCase())

  const [localChildCategoryName, setLocalChildCategoryName] = useState(null)

  const handleCategoryChange = (selectedCategory) => {
    setLocalChildCategoryName(selectedCategory)
  }

  const initialCategoryValue = localChildCategoryName || ''

  const handleUpdateChildCategories = async () => {
    if (!categoryNames.includes(localChildCategoryName.toLowerCase())) {
      const newCategory = await dispatch(createCategory(localChildCategoryName))
      await dispatch(
        updateChildCategories({ childCategoryId: newCategory.payload.id, parentCategoryId: currentCategory.id })
      )
      await dispatch(setCurrentCategory(currentCategory.id))
    } else {
      const childCategory = allCategories.filter((item) => item.name === localChildCategoryName)
      await dispatch(
        updateChildCategories({ childCategoryId: childCategory[0].id, parentCategoryId: currentCategory.id })
      )
      await dispatch(setCurrentCategory(currentCategory.id))
    }
  }

  return (
    <div className={className}>
      <DefaultAutoCompleteInput
        inputValue={initialCategoryValue}
        onChange={handleCategoryChange}
        options={categoryNames}
        placeholder="Add Child Category"
      />
      <TextButton onClick={handleUpdateChildCategories}>Add</TextButton>
    </div>
  )
}

export default ChildCategoryInput
