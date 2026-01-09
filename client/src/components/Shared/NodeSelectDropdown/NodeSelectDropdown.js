import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'

import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './NodeSelectDropdown.module.scss'

function NodeSelectDropdown({ className, onSelect, onChange }) {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const { entryId } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  const [inputValue, setInputValue] = useState('')

  // Filter out the current entry and already-connected nodes
  const filterOptions = useCallback((options, conns) => {
    if (!options) return []
    const connectionIds = conns?.flatMap((conn) => [conn.foreign_entry_id, conn.primary_entry_id]) || []

    return options.filter((option) => {
      return !connectionIds.includes(option.id)
    })
  }, [])

  const filteredNodeEntriesInfo = filterOptions(nodeEntriesInfo?.filter((x) => x?.id !== entryId) || [], connections)

  const handleOnChange = (value) => {
    onChange?.(value)
    // Don't call onSelect here - let handleOnSubmit handle it to avoid double-calls
  }

  const handleOnSubmit = (selectedTitle) => {
    if (!selectedTitle) return

    // Search in all nodes (case-insensitive) to find the entry
    const foundEntry = nodeEntriesInfo?.find((x) => x.title?.toLowerCase() === selectedTitle?.toLowerCase())

    if (foundEntry) {
      onSelect?.(foundEntry.id)
    }
  }

  return (
    <div className={classNames(styles.wrapper, className)}>
      <DefaultAutoCompleteDropdown
        onChange={handleOnChange}
        onSubmit={handleOnSubmit}
        placeholder={'Select or create node to connect...'}
        inputValue={inputValue}
        setInputValue={setInputValue}
        options={filteredNodeEntriesInfo.map((x) => x.title)}
      />
    </div>
  )
}

export default NodeSelectDropdown
