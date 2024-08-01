import React, { useState } from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'

// Redux
import { createNodeEntry } from '@redux/reducers/currentEntryReducer'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './GeneralNodeSelector.module.scss'

function GeneralNodeSelector({ className }) {
  const history = useHistory()
  const dispatch = useDispatch()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const { entryId } = useSelector((state) => state.currentEntry)

  const [inputValue, setInputValue] = useState('')
  const [foundEntry, setFoundEntry] = useState(null)

  const handleOnChange = async (v) => {
    const entry = nodeEntriesInfo.find((x) => x.title.toLowerCase() === v.toLowerCase())
    setFoundEntry(entry)
  }

  const handleCreateNodeEntry = async () => {
    const newNode = await dispatch(createNodeEntry({ title: inputValue }))
    history.push(`/edit-node-entry?entryId=${newNode.payload.id}`)
    setInputValue('')
  }

  const handleOnSubmit = async (entryTitle) => {
    if (entryTitle) {
      const entry = nodeEntriesInfo.find((x) => x.title.toLowerCase() === entryTitle.toLowerCase())

      history.push(`/edit-node-entry?entryId=${entry.id}`)
      setInputValue('')
    } else {
      handleCreateNodeEntry()
    }
  }

  const handleTargetInput = (event, ref) => {
    if (event.metaKey && event.shiftKey && event.key === 'f') {
      ref.current.focus()
    }
  }

  return (
    <div className={classNames(styles.wrapper, className)}>
      <DefaultAutoCompleteDropdown
        handleTargetInput={handleTargetInput}
        onChange={handleOnChange}
        placeholder={'Select node...'}
        inputValue={inputValue}
        setInputValue={setInputValue}
        options={nodeEntriesInfo.filter((n) => n.id !== entryId).map((x) => x.title)}
        onSubmit={handleOnSubmit}
        className={styles.dropDown}
      />
      {inputValue && !foundEntry ? (
        <DefaultButton className={styles.createButton} onClick={handleCreateNodeEntry}>
          Create
        </DefaultButton>
      ) : null}
    </div>
  )
}

export default GeneralNodeSelector
