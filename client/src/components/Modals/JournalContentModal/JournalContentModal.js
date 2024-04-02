// Packages
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { MODAL_NAMES } from '../../../constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '../../Shared/DefaultButton/DefaultButton'

// Redux
import { saveJournalEntry } from '../../../redux/reducers/currentEntryReducer'

import styles from './JournalContentModal.module.scss'

export const JournalContentModal = () => {
  const dispatch = useDispatch()

  const { wordCount, content, entryId, wpm, timeElapsed } = useSelector((state) => state.currentEntry)
  //   const { journalConfig } = useSelector((state) => state.journalEntries)

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.JOURNAL_CONTENT}>
      <div className={styles.wrapper}>
        <div className={styles.contentDiv}>{content}</div>
      </div>
    </BaseModalWrapper>
  )
}
