//Package Imports
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames'
import moment from 'moment'

//SCSS
import '@styles/shared.scss'
import styles from './CreateJournalEntry.module.scss'

//Redux Function Import
import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer.js'
import { saveJournalEntry, setEntryById } from '@redux/reducers/currentEntryReducer'
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

// Hooks
import useIsMobile from '@hooks/useIsMobile'

// Constants
import { ENTRY_TYPES } from '@constants/entryTypes'
import { MODAL_NAMES } from '@constants/modalNames'
import { SAVE_TYPES } from '@constants/saveTypes'

// Utils
import { normalizeEntryId } from '@utils/normalizeEntryId'

//Pillars
import PillarTop from '@components/PillarsComponents/PillarTopComponent.js'
import PillarLeft from '@components/PillarsComponents/PillarLeftComponent.js'
import PillarRight from '@components/PillarsComponents/PillarRightComponent.js'
import PillarBottom from '@components/PillarsComponents/PillarBottomComponent.js'

const CreateJournalEntry = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [successModalSeen, setSuccessModalSeen] = useState(false)

  const { wordCount, content, entryId, wpm, timeElapsed, entriesLoading } = useSelector((state) => state.currentEntry)
  const { journalConfig } = useSelector((state) => state.journalEntries)

  const journalDateLabel = useMemo(() => moment().format('MM/DD/YYYY'), [])

  const handleSaveJournal = async () => {
    await dispatch(saveJournalEntry({ content, wordCount, entryId, wpm, timeElapsed }))
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const entryIdParam = normalizeEntryId(params.get('entryId'))
    if (entryIdParam != null) {
      dispatch(setEntryById(entryIdParam))
    }
  }, [dispatch, location.search])

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
        <BgImage />
        {!isMobile && (
          <div className={styles.headerPromptContainer}>
            <Header />
            <PromptsDisplay />
          </div>
        )}
        <div className={classNames(styles.pillarsAllContainer, { [styles.mobileLayout]: isMobile })}>
          {!isMobile && <PillarTop />}
          <div className={styles.mainContainer}>
            {!isMobile && <PillarLeft />}
            <div className={styles.innerContainer}>
              {isMobile ? (
                <h2 className={styles.mobileJournalTitle}>Journal: {journalDateLabel}</h2>
              ) : (
                <JournalInfoContainer />
              )}
              <div className={styles.entryRegion}>
                <CreateEntry entryType={ENTRY_TYPES.JOURNAL} fillHeight={isMobile} />
              </div>
              <div className={classNames(styles.saveRow, { [styles.mobileBottomBar]: isMobile })}>
                {isMobile && <span className={styles.wordCount}>Words: {wordCount}</span>}
                <span className={styles.saveCell}>
                  {entriesLoading ? (
                    <SmallSpinner />
                  ) : (
                    <DefaultButton disabled={!content.length} onClick={handleSaveJournal}>
                      {isMobile ? 'Save' : 'Save Journal'}
                    </DefaultButton>
                  )}
                </span>
                {isMobile && <span className={styles.bottomBarSpacer} aria-hidden="true" />}
              </div>
            </div>
            {!isMobile && <PillarRight />}
          </div>
          {!isMobile && <PillarBottom />}
        </div>
      </div>
    )
  )
}

export default CreateJournalEntry
