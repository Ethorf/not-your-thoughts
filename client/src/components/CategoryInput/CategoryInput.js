import React, { useState, useEffect } from 'react'

import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

import { useDispatch, useSelector } from 'react-redux'

import { setCategory } from '@redux/reducers/currentEntryReducer.js'
import { fetchCategories } from '@redux/reducers/categoriesReducer.js'

const CategoryInput = ({ className }) => {
  const dispatch = useDispatch()
  const { category } = useSelector((state) => state.currentEntry)
  const [options, setOptions] = useState([])

  useEffect(() => {
    dispatch(fetchCategories())
      .then((response) => {
        if (Array.isArray(response.payload)) {
          const categoryNames = response.payload.map((category) => category.name)
          setOptions(categoryNames)
        } else {
          console.error('Response payload is not an array:', response.payload)
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error)
      })
  }, [dispatch])

  const handleCategoryChange = (selectedCategory) => {
    dispatch(setCategory(selectedCategory))
  }

  const initialCategoryValue = category || ''

  return (
    <div className={className}>
      <DefaultAutoCompleteInput
        inputValue={initialCategoryValue}
        onChange={handleCategoryChange}
        options={options}
        placeholder="Category"
      />
    </div>
  )
}

export default CategoryInput
