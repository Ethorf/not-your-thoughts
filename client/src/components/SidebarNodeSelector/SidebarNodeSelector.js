import React, { useState } from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'

// Redux
import { createNodeEntry } from '@redux/reducers/currentEntryReducer'
import { toggleSidebar } from '@redux/reducers/sidebarReducer'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './SidebarNodeSelector.module.scss'

function SidebarNodeSelector({ className }) {
  const history = useHistory()
  const dispatch = useDispatch()
  const nodeEntriesInfo = useNodeEntriesInfo()

  const { entryId } = useSelector((state) => state.currentEntry)
  const { sidebarOpen } = useSelector((state) => state.sidebar)

  const [inputValue, setInputValue] = useState('')
  const [foundEntry, setFoundEntry] = useState(null)

  const handleOnChange = async (v) => {
    const entry = nodeEntriesInfo.find((x) => x.title.toLowerCase() === v.toLowerCase())
    setFoundEntry(entry)
  }

  const handleCreateNodeEntry = async () => {
    console.log('<<<<<< inputValue >>>>>>>>> is: <<<<<<<<<<<<')
    console.log(inputValue)
    const newNode = await dispatch(createNodeEntry({ title: inputValue }))

    // history.push(`/edit-node-entry?entryId=${newNode.payload.id}`)
    setInputValue('')
    dispatch(toggleSidebar())
  }

  const handleOnSubmit = async (entryTitle) => {
    if (entryTitle) {
      const entry = nodeEntriesInfo.find((x) => x.title.toLowerCase() === entryTitle.toLowerCase())

      history.push(`/edit-node-entry?entryId=${entry.id}`)
      setInputValue('')
    } else {
      handleCreateNodeEntry()
    }
    dispatch(toggleSidebar())
  }

  const handleTargetInput = (event, ref) => {
    ref.current.focus()
  }

  return (
    <div className={classNames(styles.wrapper, className)}>
      {sidebarOpen ? (
        <DefaultAutoCompleteDropdown
          insideSidebar
          handleTargetInput={handleTargetInput}
          onChange={handleOnChange}
          placeholder={'Select node...'}
          inputValue={inputValue}
          setInputValue={setInputValue}
          options={nodeEntriesInfo.filter((n) => n.id !== entryId).map((x) => x.title)}
          onSubmit={handleOnSubmit}
          className={styles.dropDown}
        />
      ) : (
        <div className={styles.placeholder} />
      )}
      <div className={styles.createButtonContainer}>
        {inputValue && !foundEntry ? (
          <DefaultButton className={styles.createButton} onClick={handleCreateNodeEntry}>
            Create node
          </DefaultButton>
        ) : null}
      </div>
    </div>
  )
}

export default SidebarNodeSelector
