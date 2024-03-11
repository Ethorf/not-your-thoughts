import React, { useState, useEffect } from 'react'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'
import { useDispatch, useSelector } from 'react-redux'
import { setCategory, fetchCategories } from '../../redux/reducers/currentEntryReducer.js'

const CategoryInput = ({ className }) => {
  const dispatch = useDispatch()
  const { category } = useSelector((state) => state.currentEntry)
  const [options, setOptions] = useState([])

  useEffect(() => {
    dispatch(fetchCategories()).then((response) => {
      const categoryNames = response.payload.map((category) => category.name)
      setOptions(categoryNames)
    })
  }, [dispatch])

  const handleCategoryChange = (selectedCategory) => {
    dispatch(setCategory(selectedCategory))
  }

  // Initialize category with an empty string to prevent uncontrolled input error
  const initialCategoryValue = category || ''

  return (
    <div className={className}>
      <DefaultAutoCompleteInput
        inputValue={initialCategoryValue}
        onChange={handleCategoryChange}
        options={options}
        placeholder={'Category'}
      />
    </div>
  )
}

export default CategoryInput
