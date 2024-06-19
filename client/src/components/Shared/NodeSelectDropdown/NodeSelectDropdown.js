import React from 'react'
import { useSelector } from 'react-redux'

import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'

function NodeSelectDropdown({ onSelect, onChange }) {
  const { nodeEntriesInfo, entryId } = useSelector((state) => state.currentEntry)

  const handleOnChange = (value) => {
    onChange(value)

    const foundEntry = nodeEntriesInfo.find((x) => x.title.toLowerCase() === value.toLowerCase())
    if (foundEntry) {
      onSelect(foundEntry.id)
    }
  }

  return (
    <div>
      <p>Select node to connect</p>
      <DefaultAutoCompleteDropdown
        onChange={handleOnChange}
        placeholder={'Select or create node...'}
        options={nodeEntriesInfo.filter((x) => x.id !== entryId).map((x) => x.title)}
      />
    </div>
  )
}

export default NodeSelectDropdown
