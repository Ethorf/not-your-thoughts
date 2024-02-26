import React from 'react'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'
import { useDispatch, useSelector } from 'react-redux'
import { setCategory } from '../../redux/reducers/currentEntryReducer.js'

const CategoryInput = () => {
  const options = ['jeff', 'fred', 'bong']
  const dispatch = useDispatch()
  const { category } = useSelector((state) => state.currentEntry)

  console.log('category is:')
  console.log(category)

  const handleCategoryChange = (selectedCategory) => {
    dispatch(setCategory(selectedCategory))
  }

  return (
    <div>
      <DefaultAutoCompleteInput
        inputValue={category}
        onChange={handleCategoryChange}
        options={options}
        placeholder={'Category'}
      />
    </div>
  )
}

export default CategoryInput
