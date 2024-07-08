import React, { useState } from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

import DefaultAutoCompleteDropdown from '@components/Shared/DefaultAutoCompleteDropdown/DefaultAutoCompleteDropdown'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './GeneralNodeSelector.module.scss'

function GeneralNodeSelector({ className }) {
  const history = useHistory()
  const [inputValue, setInputValue] = useState('')
  const nodeEntriesInfo = useNodeEntriesInfo()

  const handleOnChange = (value) => {
    const foundEntry = nodeEntriesInfo.find((x) => x.title.toLowerCase() === value.toLowerCase())
    if (foundEntry) {
      history.push(`/edit-node-entry?entryId=${foundEntry.id}`)
      setInputValue('')
    }
  }

  return (
    <div className={classNames(styles.wrapper, className)}>
      <DefaultAutoCompleteDropdown
        onChange={handleOnChange}
        placeholder={'Select node...'}
        inputValue={inputValue}
        setInputValue={setInputValue}
        options={nodeEntriesInfo.map((x) => x.title)}
      />
    </div>
  )
}

export default GeneralNodeSelector
