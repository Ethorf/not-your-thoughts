import React, { useState } from 'react'

import TextButton from '@components/Shared/TextButton/TextButton.js'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

import { useDispatch, useSelector } from 'react-redux'

import { createCategory, updateParentCategory } from '@redux/reducers/categoriesReducer.js'
import useCategories from '@hooks/useCategories'

const ParentCategoryInput = ({ className }) => {
  const dispatch = useDispatch()
  const { allCategories } = useCategories()
  const { currentCategory } = useSelector((state) => state.categories)
  const categoryNames = allCategories.map((cat) => cat.name.toLowerCase())

  const [localParentCategoryName, setLocalParentCategoryName] = useState(null)

  const handleCategoryChange = (selectedCategory) => {
    setLocalParentCategoryName(selectedCategory)
  }

  const initialCategoryValue = localParentCategoryName || ''

  const handleUpdateParentCategory = async () => {
    if (!categoryNames.includes(localParentCategoryName.toLowerCase())) {
      const newCategory = await dispatch(createCategory(localParentCategoryName))
      await dispatch(
        updateParentCategory({ childCategoryId: currentCategory.id, parentCategoryId: newCategory.payload.id })
      )
    } else {
      const parentCategory = allCategories.filter((item) => item.name === localParentCategoryName)
      await dispatch(
        updateParentCategory({ childCategoryId: currentCategory.id, parentCategoryId: parentCategory[0].id })
      )
    }
  }

  return (
    <div className={className}>
      <DefaultAutoCompleteInput
        inputValue={initialCategoryValue}
        onChange={handleCategoryChange}
        options={categoryNames}
        placeholder="Add Parent Category"
      />
      <TextButton onClick={handleUpdateParentCategory}>Add</TextButton>
    </div>
  )
}

export default ParentCategoryInput
