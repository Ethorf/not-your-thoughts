import React from 'react'
import { useSelector } from 'react-redux'

import DefaultDropdown from '@components/Shared/DefaultDropdown/DefaultDropdown'
import DefaultAutoCompleteInput from '@components/Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput'
import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'

function NodeSelectDropdown() {
  const { nodeEntriesInfo } = useSelector((state) => state.currentEntry)

  return (
    <div>
      <p>Select node to connect</p>
      <DefaultAutoCompleteDropdown placeholder={'Select node...'} options={nodeEntriesInfo.map((x) => x.title)} />
    </div>
  )
}

export default NodeSelectDropdown
