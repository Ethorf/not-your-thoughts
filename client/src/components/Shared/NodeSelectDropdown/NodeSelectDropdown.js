import React from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'

import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './NodeSelectDropdown.module.scss'

function NodeSelectDropdown({ inputValue, setInputValue, className, onSelect, onChange }) {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const { entryId } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  const handleOnChange = (value) => {
    onChange(value)

    const foundEntry = nodeEntriesInfo?.find((x) => x.title.toLowerCase() === value.toLowerCase())
    if (foundEntry) {
      onSelect(foundEntry.id)
    }
  }

  // Filter out the current entry and already-connected nodes
  const filterOptions = (options, connections) => {
    if (!options) return []
    const connectionIds = connections?.flatMap((conn) => [conn.foreign_entry_id, conn.primary_entry_id]) || []

    return options.filter((option) => {
      return !connectionIds.includes(option.id)
    })
  }

  const filteredNodeEntriesInfo = filterOptions(nodeEntriesInfo?.filter((x) => x?.id !== entryId) || [], connections)
  console.log('<<<<<< inputValue >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(inputValue)
  console.log('<<<<<< inputValue >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(inputValue)
  return (
    <div className={classNames(styles.wrapper, className)}>
      <DefaultAutoCompleteDropdown
        onChange={handleOnChange}
        placeholder={'Select or create node to connect...'}
        inputValue={inputValue}
        setInputValue={setInputValue}
        options={filteredNodeEntriesInfo.map((x) => x.title)}
      />
    </div>
  )
}

export default NodeSelectDropdown
