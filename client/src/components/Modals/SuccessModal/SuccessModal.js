// Packages
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '../../../constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '../../Shared/DefaultButton/DefaultButton'

// Redux
import { saveJournalEntry } from '../../../redux/reducers/currentEntryReducer'

import styles from './SuccessModal.module.scss'

export const SuccessModal = () => {
  const dispatch = useDispatch()
  const { wordCount, content, entryId, wpm, timeElapsed } = useSelector((state) => state.currentEntry)
  //   const { journalConfig } = useSelector((state) => state.journalEntries)

  const handleSaveJournal = async () => {
    await dispatch(saveJournalEntry({ content, wordCount, entryId, wpm, timeElapsed }))
  }

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.SUCCESS}>
      <div className={styles.wrapper}>
        <h2>Great jarb!</h2>
        <DefaultButton disabled={!content.length} onClick={handleSaveJournal}>
          Save Journal
        </DefaultButton>
      </div>
    </BaseModalWrapper>
  )
}
