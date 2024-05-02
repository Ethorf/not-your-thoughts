import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAkas } from '@redux/reducers/currentEntryReducer.js'
import { openModal } from '@redux/reducers/modalsReducer.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import { MODAL_NAMES } from '@constants/modalNames'

import styles from './AkasDisplay.module.scss'

function AkasDisplay() {
  const dispatch = useDispatch()
  const { entryId, akas } = useSelector((state) => state.currentEntry)

  useEffect(() => {
    dispatch(fetchAkas(entryId))
  }, [dispatch, entryId])

  const handleOpenAkasModal = () => {
    dispatch(openModal(MODAL_NAMES.AKAS_INPUT))
  }
  return (
    <div>
      <TextButton onClick={handleOpenAkasModal} className={styles.button} tooltip="Add AKAs">
        AKA
      </TextButton>
    </div>
  )
}

export default AkasDisplay
