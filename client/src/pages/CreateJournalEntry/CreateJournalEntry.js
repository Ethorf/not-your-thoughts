//Package Imports
import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { connect, useDispatch, useSelector } from 'react-redux'

//SCSS
import '../../styles/shared.scss'

//Redux Function Imports
import {
  changeWordCount,
  changeCharCount,
  saveJournalEntry,
  setJournalEntry,
} from '../../redux/actions/journalEntryActions.js'
import { getJournalConfig, toggleTimerActive } from '../../redux/actions/journalConfigActions.js'
import { loadUser, increaseDays } from '../../redux/actions/authActions.js'
import { openSuccessModal, openSaveEntryModal, toggleGuestModeModalSeen } from '../../redux/actions/modalActions.js'
import { changeMode } from '../../redux/actions/modeActions.js'
import { createNodeEntry } from '../../redux/reducers/currentEntryReducer'

//Component Imports
import Header from '../../components/header/header.js'
import BgImage from '../../components/bgImage/bgImage.js'
import Prompt from '../../components/prompt/prompt.js'
import CreateEntry from '../../components/Shared/CreateEntry/CreateEntry'

// Constants
import { ENTRY_TYPES } from '../../constants/entryTypes'

//Pillars
import PillarTop from '../../components/pillars/pillarTop.js'
import PillarLeft from '../../components/pillars/pillarLeft.js'
import PillarRight from '../../components/pillars/pillarRight.js'
import PillarBottom from '../../components/pillars/pillarBottom.js'
import ProgressWord from '../../components/progress/progressWord.js'

//Modals
import SuccessModal from '../../components/Modals/successModal.js'
import GuestModeModal from '../../components/Modals/guestModeModal.js'
import IntroModal from '../../components/Modals/introModal.js'
import SaveEntryModal from '../../components/Modals/saveEntryModal.js'
import Spinner from '../../components/Shared/Spinner/Spinner.js'
import TimerDisplay from '../../components/timerDisplay/timerDisplay.js'
import { createJournalEntry } from '../../redux/reducers/currentEntryReducer.js'

const CreateJournalEntry = ({
  openSaveEntryModal,
  charCount,
  getJournalConfig,
  saveJournalEntry,
  journalConfig,
  mode,
  auth: { guestMode, user, loading },
  entry,
  timeElapsed,
  modals,
  toggleGuestModeModalSeen,
}) => {
  const dispatch = useDispatch()

  const [wpmCalc, setWpmCalc] = useState(Math.trunc((charCount / 5 / timeElapsed) * 60))
  const [wpmCounter, setWpmCounter] = useState(0)
  const [guestModeModalOpen, setGuestModeModalOpen] = useState(false)
  const { wordCount, content } = useSelector((state) => state.currentEntry)

  // TODO fix WPM this shit broken
  useEffect(() => {
    // setWpmCalc((timeElapsed / 2) % 5 === 0 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : wpmCalc)
    let wpmInterval = null

    wpmInterval = setInterval(() => {
      setWpmCounter(wpmCalc)
    }, 2000)

    return () => clearInterval(wpmInterval)
  }, [charCount, timeElapsed, wpmCalc, wpmCounter])
  // Guest Modal stuff
  useEffect(() => {
    if (guestMode && modals.guestModeModalSeen === false) {
      setTimeout(() => {
        toggleGuestModeModalSeen()
        setGuestModeModalOpen(true)
      }, 1500)
    }
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    openSaveEntryModal()
    saveJournalEntry({
      entry,
      // TODO update with real values once we fix timer & wpm
      timeElapsed: 0,
      wpm: Math.trunc((charCount / 5 / timeElapsed) * 60),
      wordCount,
    })
  }

  const handleSaveNode = async () => {
    const newNode = await dispatch(createJournalEntry({ content }))
  }

  useEffect(() => {
    getJournalConfig()
  }, [])

  if (loading) {
    return <Spinner />
  }

  // We need this User check here because of all the user accessing in the JSX
  // On initial render this won't even run even if loading === false because it'll be trying
  //  to access a bunch of values in the JSX (which renders before useEffect)
  return (
    user &&
    journalConfig && (
      <div className={`main__all-container modalize ${mode}`}>
        <BgImage />
        <div className={`CreateJournalEntry ${mode}`}>
          <Header />
          {/* <SaveEntryModal />
          <SuccessModal />
          <IntroModal />
          <GuestModeModal
            toggleGuestModeModalOpen={() => setGuestModeModalOpen(!guestModeModalOpen)}
            guestModeModalOpen={guestModeModalOpen}
          /> */}
          {/* <Prompt /> */}
          <ProgressWord />
          <PillarTop />
          <div className={`main__pillars-date-goal-wordcount-textarea-container`}>
            <PillarLeft />
            <form className={`main__date-goal-wordcount-textarea-container`} onSubmit={(e) => onSubmit(e)}>
              <div className={`main__date-goal-wordcount-container${mode}`}>
                <h3 className={`main__date `}>{moment().format('MM/DD/YYYY')}</h3>
                {/* <span
                  className={'main__timer-display'}
                  style={guestMode || user.timerEnabled ? { opacity: 1 } : { opacity: 0 }}
                >
                  <TimerDisplay />
                </span> */}
                {guestMode ? (
                  <h2 className={`main__goal`}>Goal: 200 words</h2>
                ) : (
                  <h2 className={`main__goal`}>
                    Goal:{' '}
                    {journalConfig.goal_preference === 'words'
                      ? `${journalConfig.daily_words_goal} Words`
                      : `${journalConfig.daily_time_goal} Minute${journalConfig.daily_time_goal >= 2 ? 's' : ''}`}
                  </h2>
                )}
                <h3
                  className={`main__wpm-text-container`}
                  style={
                    guestMode || (journalConfig.wpm_enabled && window.innerWidth > 767)
                      ? { opacity: 1 }
                      : { opacity: 0 }
                  }
                >
                  <div className={`main__wpm-text-left`}>
                    {charCount >= 20 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : 'N/A'}
                  </div>
                  <div className={`main__wpm-text-right`}> WPM</div>
                </h3>
                <h3 className={`main__wordcount`}>
                  <span style={{ color: 'white', marginRight: '5px' }}>{wordCount}</span> Words
                </h3>
              </div>
              <CreateEntry type={ENTRY_TYPES.JOURNAL} />
              <div className={`main__save-entry-button-container  `}>
                {guestMode ? null : (
                  <button onClick={onSubmit} type="submit" className={`main__save-entry-button${mode}`}>
                    Save Entry
                  </button>
                )}
              </div>
            </form>
            <PillarRight />
          </div>
          <PillarBottom />˜
        </div>
      </div>
    )
  )
}

CreateJournalEntry.propTypes = {
  auth: PropTypes.object.isRequired,
  saveJournalEntry: PropTypes.func.isRequired,
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
  saveJournalEntry,
  openSaveEntryModal,
  openSuccessModal,
  changeWordCount,
  changeCharCount,
  loadUser,
  setJournalEntry,
  increaseDays,
  changeMode,
  toggleTimerActive,
  getJournalConfig,
  toggleGuestModeModalSeen,
})(CreateJournalEntry)
