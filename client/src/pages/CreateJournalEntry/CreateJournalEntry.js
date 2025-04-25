//Package Imports
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

//SCSS
import '@styles/shared.scss'
import styles from './CreateJournalEntry.module.scss'

//Redux Function Import
import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer.js'
import { saveJournalEntry } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

//Component Imports
import Header from '@components/HeaderComponent/HeaderComponent.js'
import JournalInfoContainer from '@components/JournalInfoContainer/JournalInfoContainer.js'
import BgImage from '@components/bgImage/bgImage.js'
import PromptsDisplay from '@components/PromptsDisplay/PromptsDisplay.js'
import CreateEntry from '@components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner.js'
import WritingDataManager from '@components/Shared/WritingDataManager/WritingDataManager'

// Constants
import { ENTRY_TYPES } from '@constants/entryTypes'
import { MODAL_NAMES } from '@constants/modalNames'
import { SAVE_TYPES } from '@constants/saveTypes'

//Pillars
import PillarTop from '@components/PillarsComponents/PillarTopComponent.js'
import PillarLeft from '@components/PillarsComponents/PillarLeftComponent.js'
import PillarRight from '@components/PillarsComponents/PillarRightComponent.js'
import PillarBottom from '@components/PillarsComponents/PillarBottomComponent.js'
import ProgressWord from '@components/progress/progressWord.js'

const CreateJournalEntry = () => {
  const dispatch = useDispatch()
  const [successModalSeen, setSuccessModalSeen] = useState(false)

  const { wordCount, content, entryId, wpm, timeElapsed, entriesLoading } = useSelector((state) => state.currentEntry)
  const { journalConfig } = useSelector((state) => state.journalEntries)

  const handleSaveJournal = async () => {
    await dispatch(saveJournalEntry({ content, wordCount, entryId, wpm, timeElapsed }))
  }

  useEffect(() => {
    dispatch(fetchJournalConfig())
  }, [dispatch])

  useEffect(() => {
    if (journalConfig && wordCount >= journalConfig.daily_words_goal && !successModalSeen) {
      dispatch(openModal(MODAL_NAMES.SUCCESS))
      setSuccessModalSeen(true)
    }
  }, [dispatch, journalConfig, successModalSeen, wordCount])

  return (
    journalConfig && (
      <div className={styles.wrapper}>
        {wordCount > 0 ? (
          <WritingDataManager
            entryType={ENTRY_TYPES.JOURNAL}
            handleAutosave={() => handleSaveJournal(SAVE_TYPES.AUTO)}
          />
        ) : null}
        <ProgressWord />
        <BgImage />
        <div className={styles.headerPromptContainer}>
          <Header />
          <PromptsDisplay />
        </div>
        <div className={styles.pillarsAllContainer}>
          <PillarTop />
          <div className={styles.mainContainer}>
            <PillarLeft />
            <div className={styles.innerContainer}>
              <JournalInfoContainer />
              <CreateEntry entryType={ENTRY_TYPES.JOURNAL} />
              {entriesLoading ? (
                <SmallSpinner />
              ) : (
                <DefaultButton disabled={!content.length} onClick={handleSaveJournal}>
                  Save Journal
                </DefaultButton>
              )}
            </div>
            <PillarRight />
          </div>
          <PillarBottom />
        </div>
      </div>
    )
  )
}

export default CreateJournalEntry
