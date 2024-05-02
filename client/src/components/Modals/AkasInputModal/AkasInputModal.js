// Packages
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import DefaultAutoCompleteInput from '@components/Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'

// Redux
import { addAka } from '@redux/reducers/currentEntryReducer.js'

import styles from './AkasInputModal.module.scss'

export const AkasInputModal = () => {
  const dispatch = useDispatch()
  const [akaInput, setAkaInput] = useState([])

  const { akas, entryId } = useSelector((state) => state.currentEntry)

  const handleAddAka = () => {
    dispatch(addAka({ aka: akaInput, entryId }))
    setAkaInput('')
  }
  console.log('akas is:')
  console.log(akas)
  return (
    <BaseModalWrapper modalName={MODAL_NAMES.AKAS_INPUT}>
      <div className={styles.wrapper}>
        <h2>AKA:</h2>
        <div className={styles.currentAkasContainer}>
          {akas.map((aka, idx) => (
            <span className={styles.aka} key={idx}>
              {aka.aka_value}
            </span>
          ))}
        </div>
        <div className={styles.akasInputContainer}>
          <DefaultAutoCompleteInput
            inputValue={akaInput}
            onChange={(e) => setAkaInput(e.toLowerCase())}
            options={[]}
            placeholder={'Add Aka Here'}
            className={styles.akasInput}
          />
          <DefaultButton onClick={handleAddAka}>ADD</DefaultButton>
        </div>
      </div>
    </BaseModalWrapper>
  )
}
