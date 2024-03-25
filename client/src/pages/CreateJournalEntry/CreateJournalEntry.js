//Package Imports
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect, useDispatch, useSelector } from 'react-redux'

//SCSS
import '../../styles/shared.scss'
import styles from './CreateJournalEntry.module.scss'

//Redux Function Imports
import { changeWordCount, changeCharCount, setJournalEntry } from '../../redux/actions/journalEntryActions.js'
import { getJournalConfig, toggleTimerActive } from '../../redux/actions/journalConfigActions.js'
import { increaseDays } from '../../redux/actions/authActions.js'
import { toggleGuestModeModalSeen } from '../../redux/actions/modalActions.js'
import { changeMode } from '../../redux/actions/modeActions.js'
import { saveJournalEntry } from '../../redux/reducers/currentEntryReducer'

//Component Imports
import Header from '../../components/Header/Header.js'
import JournalInfoContainer from '../../components/JournalInfoContainer/JournalInfoContainer.js'
import BgImage from '../../components/bgImage/bgImage.js'
import Prompt from '../../components/prompt/prompt.js'
import CreateEntry from '../../components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'
import Spinner from '../../components/Shared/Spinner/Spinner.js'

// Constants
import { ENTRY_TYPES } from '../../constants/entryTypes'

//Pillars
import PillarTop from '../../components/pillars/pillarTop.js'
import PillarLeft from '../../components/pillars/pillarLeft.js'
import PillarRight from '../../components/pillars/pillarRight.js'
import PillarBottom from '../../components/pillars/pillarBottom.js'
import ProgressWord from '../../components/progress/progressWord.js'

const CreateJournalEntry = ({ getJournalConfig, journalConfig, auth: { guestMode, user, loading } }) => {
  const dispatch = useDispatch()

  const { wordCount, content, entryId } = useSelector((state) => state.currentEntry)

  const handleSaveJournal = async () => {
    await dispatch(saveJournalEntry({ content, wordCount, entryId }))
  }

  useEffect(() => {
    getJournalConfig()
  }, [])

  // if (loading) {
  //   return <Spinner />
  // }

  // We need this User check here because of all the user accessing in the JSX
  // On initial render this won't even run even if loading === false because it'll be trying
  //  to access a bunch of values in the JSX (which renders before useEffect)
  // TODO remove these checks eventually once private route is improved

  return (
    user &&
    journalConfig && (
      <div className={styles.wrapper}>
        <ProgressWord />
        <BgImage />
        <div className={styles.headerPromptContainer}>
          <Header />
          {/* <Prompt /> */}
        </div>
        <div className={styles.pillarsAllContainer}>
          <PillarTop />
          <div className={styles.mainContainer}>
            <PillarLeft />
            <form
              className={`main__date-goal-wordcount-textarea-container`}
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <JournalInfoContainer />
              {/* TODO gotta fix this weird width thing but that shoul dbe an easy grunt for will or omog */}
              <CreateEntry type={ENTRY_TYPES.JOURNAL} />
              {guestMode ? null : (
                <DefaultButton disabled={!content.length} onClick={handleSaveJournal}>
                  Save Journal
                </DefaultButton>
              )}
            </form>
            <PillarRight />
          </div>
          <PillarBottom />
        </div>
      </div>
    )
  )
}

CreateJournalEntry.propTypes = {
  auth: PropTypes.object.isRequired,
  setJournalEntry: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  wordCount: state.wordCount.wordCount,
  charCount: state.wordCount.charCount,
  goal: state.wordCount.goal,
  isAuthenticated: state.auth.isAuthenticated,
  modals: state.modals,
  mode: state.modes.mode,
  entry: state.entries.entry,
  timeElapsed: state.entries.timeElapsed,
  journalConfig: state.entries.journalConfig,
  timerActive: state.entries.timerActive,
})

export default connect(mapStateToProps, {
  changeWordCount,
  changeCharCount,
  setJournalEntry,
  increaseDays,
  changeMode,
  toggleTimerActive,
  getJournalConfig,
  toggleGuestModeModalSeen,
})(CreateJournalEntry)
