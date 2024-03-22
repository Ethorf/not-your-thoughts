//Package Imports
import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { connect, useDispatch, useSelector } from 'react-redux'

//SCSS
import '../../styles/shared.scss'
import styles from './CreateJournalEntry.module.scss'

//Redux Function Imports
import { changeWordCount, changeCharCount, setJournalEntry } from '../../redux/actions/journalEntryActions.js'
import { getJournalConfig, toggleTimerActive } from '../../redux/actions/journalConfigActions.js'
import { loadUser, increaseDays } from '../../redux/actions/authActions.js'
import { openSuccessModal, openSaveEntryModal, toggleGuestModeModalSeen } from '../../redux/actions/modalActions.js'
import { changeMode } from '../../redux/actions/modeActions.js'
import { saveJournalEntry } from '../../redux/reducers/currentEntryReducer'

//Component Imports
import Header from '../../components/Header/Header.js'
import BgImage from '../../components/bgImage/bgImage.js'
import Prompt from '../../components/prompt/prompt.js'
import CreateEntry from '../../components/Shared/CreateEntry/CreateEntry'
import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton'
import Spinner from '../../components/Shared/Spinner/Spinner.js'
import TimerDisplay from '../../components/timerDisplay/timerDisplay.js'

// Constants
import { ENTRY_TYPES } from '../../constants/entryTypes'

//Pillars
import PillarTop from '../../components/pillars/pillarTop.js'
import PillarLeft from '../../components/pillars/pillarLeft.js'
import PillarRight from '../../components/pillars/pillarRight.js'
import PillarBottom from '../../components/pillars/pillarBottom.js'
import ProgressWord from '../../components/progress/progressWord.js'

const CreateJournalEntry = ({
  charCount,
  getJournalConfig,
  journalConfig,
  mode,
  auth: { guestMode, user, loading },
  timeElapsed,
}) => {
  const dispatch = useDispatch()

  const [wpmCalc, setWpmCalc] = useState(Math.trunc((charCount / 5 / timeElapsed) * 60))
  const [wpmCounter, setWpmCounter] = useState(0)
  const { wordCount, content, entryId } = useSelector((state) => state.currentEntry)

  // TODO fix WPM this shit broken
  useEffect(() => {
    // setWpmCalc((timeElapsed / 2) % 5 === 0 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : wpmCalc)
    let wpmInterval = null

    wpmInterval = setInterval(() => {
      setWpmCounter(wpmCalc)
    }, 2000)

    return () => clearInterval(wpmInterval)
  }, [charCount, timeElapsed, wpmCalc, wpmCounter])

  const handleSaveJournal = async () => {
    await dispatch(saveJournalEntry({ content, wordCount, entryId }))
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
  // TODO remove this eventually once private route is improved

  return (
    user &&
    journalConfig && (
      <div className={styles.wrapper}>
        <BgImage />
        <Header />
        {/* <Prompt /> */}
        <ProgressWord />
        <PillarTop />
        <div className={`main__pillars-date-goal-wordcount-textarea-container`}>
          <PillarLeft />
          <form
            className={`main__date-goal-wordcount-textarea-container`}
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
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
                  guestMode || (journalConfig.wpm_enabled && window.innerWidth > 767) ? { opacity: 1 } : { opacity: 0 }
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
                <DefaultButton disabled={!content.length} onClick={handleSaveJournal}>
                  Save Journal
                </DefaultButton>
              )}
            </div>
          </form>
          <PillarRight />
        </div>
        <PillarBottom />
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
