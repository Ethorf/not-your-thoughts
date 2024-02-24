import React from 'react'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

const CategoryInput = () => {
  const options = ['jeff', 'fred', 'bong']

  return (
    <div>
      <DefaultAutoCompleteInput options={options} placeholder={'Category'} />
    </div>
  )
}

export default CategoryInput
