import React, { useState, useEffect } from 'react'
import DefaultAutoCompleteInput from '../Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'
import DefaultButton from '../Shared/DefaultButton/DefaultButton.js'

import { useDispatch, useSelector } from 'react-redux'
import { setTags, setTagInput, fetchTags } from '../../redux/reducers/currentEntryReducer.js'

const TagsInput = () => {
  const dispatch = useDispatch()
  const { tagInput, tags } = useSelector((state) => state.currentEntry)
  const [options, setOptions] = useState([])

  useEffect(() => {
    dispatch(fetchTags()).then((response) => {
      const tags = response.payload.map((category) => category.name)
      setOptions(tags)
    })
  }, [dispatch])

  const handleTagChange = (tag) => {
    dispatch(setTagInput(tag))
  }

  const handleAddTags = (tag) => {
    dispatch(setTags(tagInput))
  }

  console.log('tagInput is:')
  console.log(tagInput)

  // TODO this should have like a little hide-show dropdown thing so it's a little easier to glump with

  return (
    <div>
      <div>
        <p>Tags:{tags}</p>
      </div>
      <DefaultButton onClick={handleAddTags}>ADD TAG</DefaultButton>
      <DefaultAutoCompleteInput
        inputValue={tagInput}
        onChange={handleTagChange}
        options={options}
        placeholder={'Add Tags Here'}
      />
    </div>
  )
}

export default TagsInput
