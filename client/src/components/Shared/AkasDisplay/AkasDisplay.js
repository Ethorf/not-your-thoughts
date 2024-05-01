import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAkas } from '@redux/reducers/currentEntryReducer.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import styles from './AkasDisplay.module.scss'

function AkasDisplay() {
  const dispatch = useDispatch()
  const { entryId, akas } = useSelector((state) => state.currentEntry)

  useEffect(() => {
    dispatch(fetchAkas(entryId))
  }, [dispatch, entryId])

  console.log('akas is:')
  console.log(akas)
  console.log('entryId is:')
  console.log(entryId)
  return (
    <div>
      <TextButton className={styles.button} tooltip="Add AKAs">
        AKA
      </TextButton>
    </div>
  )
}

export default AkasDisplay
