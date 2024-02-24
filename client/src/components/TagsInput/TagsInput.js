import React from 'react'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

const TagsInput = () => {
  const options = ['jeff', 'fred', 'bong']

  return (
    <div>
      <DefaultAutoCompleteInput options={options} placeholder={'Tags'} />
    </div>
  )
}

export default TagsInput
