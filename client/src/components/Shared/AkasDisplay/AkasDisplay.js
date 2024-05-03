import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAkas } from '@redux/reducers/currentEntryReducer.js'
import { openModal } from '@redux/reducers/modalsReducer.js'

import TextButton from '@components/Shared/TextButton/TextButton.js'

import { MODAL_NAMES } from '@constants/modalNames'

import styles from './AkasDisplay.module.scss'

function AkasDisplay() {
  const dispatch = useDispatch()
  const { entryId, akas } = useSelector((state) => state.currentEntry)
  const [akasListVisible, setAkasListVisible] = useState(false)
  const [cursorInsideList, setCursorInsideList] = useState(false)

  useEffect(() => {
    dispatch(fetchAkas(entryId))
  }, [dispatch, entryId])

  const handleOpenAkasModal = () => {
    dispatch(openModal(MODAL_NAMES.AKAS_INPUT))
  }

  // TODO could improve this but it works for now
  useEffect(() => {
    if (akasListVisible && !cursorInsideList) {
      setTimeout(() => {
        if (!cursorInsideList) setAkasListVisible(false)
      }, 2000)
    }
  }, [cursorInsideList, akasListVisible])

  return (
    <div className={styles.wrapper}>
      <h3 onMouseOver={() => setAkasListVisible(true)} className={styles.button}>
        AKA
      </h3>
      {akasListVisible ? (
        <div
          className={styles.akasList}
          onMouseEnter={() => setCursorInsideList(true)}
          onMouseLeave={() => setCursorInsideList(false)}
        >
          {akas.length
            ? akas.map((aka, idx) => (
                <span className={styles.aka} key={idx}>
                  {aka.aka_value}
                </span>
              ))
            : 'No akas yet'}
          <TextButton onClick={handleOpenAkasModal} className={styles.button}>
            ADD +
          </TextButton>
        </div>
      ) : null}
    </div>
  )
}

export default AkasDisplay
