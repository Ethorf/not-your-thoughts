import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { logout, loadUser } from '../../redux/actions/authActions.js'
import { deleteJournalEntry, getJournalEntries } from '../../redux/actions/journalActions.js'
import { getJournalConfig, toggleJournalConfigSetting } from '../../redux/actions/journalConfigActions.js'

import ProfileGoalEdit from '../../components/ProfileGoalEdit/ProfileGoalEdit.js'
import TrackedPhrasesModal from '../../components/Modals/trackedPhrasesModal.js'
import CustomPrompts from '../../components/customPrompts/customPrompts.js'
import Spinner from '../../components/spinner/spinner.js'

import './profile.scss'
import '../../styles/rubberDucky.scss'

const Profile = ({ auth: { user, loading }, mode, toggleJournalConfigSetting, getJournalConfig, journalConfig }) => {
  const [localProgressAudioEnabled, setLocalProgressAudioEnabled] = useState(true)
  const [localTimerEnabled, setLocalTimerEnabled] = useState(null)
  const [localWpmEnabled, setLocalWpmEnabled] = useState(null)

  // Can we also extract this so that it's not so component specific?

  useEffect(() => {
    getJournalConfig()
  }, [])

  useEffect(() => {
    if (journalConfig !== null) {
      setLocalProgressAudioEnabled(journalConfig.progress_audio_enabled)
      setLocalTimerEnabled(journalConfig.timer_enabled)
      setLocalWpmEnabled(journalConfig.wpm_enabled)
    }
  }, [journalConfig])

  useEffect(() => {
    toggleJournalConfigSetting('Audio', localProgressAudioEnabled)
  }, [localProgressAudioEnabled])

  useEffect(() => {
    toggleJournalConfigSetting('Timer', localTimerEnabled)
  }, [localTimerEnabled])

  useEffect(() => {
    toggleJournalConfigSetting('Wpm', localWpmEnabled)
  }, [localWpmEnabled])

  if (loading) {
    return <Spinner />
  }

  return (
    user &&
    journalConfig && (
      <div className={`profile ${mode}`}>
        <div className="profile__content">
          <header className={`profile__header ${mode}`}>User Profile</header>
          <h2 className={`profile__user ${mode}`}>{user && user.name}</h2>
          <h2 className={`profile__sub-header ${mode}`}>Stats</h2>
          {user.last_day_completed !== null ? (
            <>
              <div className={`profile__stats-container ${mode}`}>
                <h2 className="profile__stats-text">
                  Consecutive Days Completed:
                  <span className={`profile__day-number ${mode}`}> {user && journalConfig.consecutive_days}</span>
                </h2>
                <h2 className="profile__total-days profile__stats-text">
                  Total Days Completed:
                  <span className={`profile__day-number ${mode}`}> {journalConfig.total_days_completed}</span>
                </h2>
              </div>
              <div className={`profile__stats-container ${mode}`}>
                <h2 className="profile__stats-text">
                  Last Day Completed:
                  <span className={`profile__day-number ${mode}`}> {journalConfig.last_day_completed}</span>
                </h2>
                <h2 className={`profile__sub-header ${mode}`}>Settings</h2>
                <ProfileGoalEdit />
              </div>
              {/* <div className={` profile__stats-text profile__edit-container`}>
                Tracked Phrases:
                <TrackedPhrasesModal />
              </div> */}
            </>
          ) : (
            <h2 className={`profile__day-number profile__no-days  ${mode}`}>No days complete yet</h2>
          )}

          <div className={`profile__stats-text profile__toggle-container`}>
            Progress Audio:
            <div className={`profile__toggle-switch`}>
              <span
                onClick={() => setLocalProgressAudioEnabled(true)}
                className={` profile__toggle-button profile__on-button ${
                  localProgressAudioEnabled ? 'profile__active' : 'profile__inactive'
                }`}
              >
                On
              </span>
              <span
                onClick={() => setLocalProgressAudioEnabled(false)}
                className={` profile__toggle-button profile__off-button ${
                  localProgressAudioEnabled ? 'profile__inactive' : 'profile__active'
                }`}
              >
                Off
              </span>
            </div>
          </div>

          <div className={`profile__stats-text profile__toggle-container`}>
            Timer:
            <div className={`profile__toggle-switch`}>
              <span
                onClick={() => setLocalTimerEnabled(true)}
                className={` profile__toggle-button profile__on-button ${
                  localTimerEnabled ? 'profile__active' : 'profile__inactive'
                }`}
              >
                On
              </span>
              <span
                onClick={() => setLocalTimerEnabled(false)}
                className={` profile__toggle-button profile__off-button ${
                  localTimerEnabled ? 'profile__inactive' : 'profile__active'
                }`}
              >
                Off
              </span>
            </div>
          </div>

          <div className={`profile__stats-text profile__toggle-container`}>
            WPM readout:
            <div className={`profile__toggle-switch`}>
              <span
                onClick={() => setLocalWpmEnabled(true)}
                className={` profile__toggle-button profile__on-button ${
                  localWpmEnabled ? 'profile__active' : 'profile__inactive'
                }`}
              >
                On
              </span>
              <span
                onClick={() => setLocalWpmEnabled(false)}
                className={` profile__toggle-button profile__off-button ${
                  localWpmEnabled ? 'profile__inactive' : 'profile__active'
                }`}
              >
                Off
              </span>
            </div>
          </div>
          {/* <CustomPrompts /> */}
        </div>
      </div>
    )
  )
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  getJournalEntries: PropTypes.func.isRequired,
  entries: PropTypes.array.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  goal: state.wordCount.goal,
  entries: state.entries.entries,
  journalConfig: state.entries.journalConfig,
  loading: state.entries,
  mode: state.modes.mode,
})

export default connect(mapStateToProps, {
  logout,
  getJournalConfig,
  deleteJournalEntry,
  loadUser,
  getJournalEntries,
  toggleJournalConfigSetting,
})(Profile)
