import React, { useEffect } from 'react'
import { connect, useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { logout, loadUser } from '../../redux/actions/authActions.js'
import { fetchJournalConfig } from '../../redux/reducers/journalEntriesReducer.js'
import { toggleJournalConfigSetting } from '../../redux/actions/journalConfigActions.js'
import ProfileGoalEdit from '../../components/ProfileGoalEditComponent/ProfileGoalEditComponent.js'
import TrackedPhrasesModal from '../../components/Modals/trackedPhrasesModal.js'
import CustomPrompts from '../../components/CustomPromptsSection/CustomPromptsSection.js'
import Spinner from '../../components/Shared/Spinner/Spinner.js'

import './ProfilePage.scss'
import '../../styles/rubberDucky.scss'

const Profile = ({ auth: { user }, mode, toggleJournalConfigSetting }) => {
  const dispatch = useDispatch()

  const { journalConfig } = useSelector((state) => state.journalEntries)

  useEffect(() => {
    dispatch(fetchJournalConfig())
  }, [dispatch])

  const handleToggle = (settingName, isEnabled) => {
    toggleJournalConfigSetting(settingName, isEnabled)
  }

  return (
    journalConfig && (
      <div className={`profile ${mode}`}>
        <div className="profile__content">
          <header className={`profile__header ${mode}`}>User Profile</header>
          <h2 className={`profile__user ${mode}`}>{user.name}</h2>

          {/* <h2 className={`profile__sub-header ${mode}`}>Stats</h2> */}
          {user.last_day_completed !== null ? (
            <>
              <div className={`profile__stats-container ${mode}`}>
                {/* <h2 className="profile__stats-text">
                  Consecutive Days Completed:
                  <span className={`profile__day-number ${mode}`}> {journalConfig.consecutive_days}</span>
                </h2> */}
                {/* <h2 className="profile__total-days profile__stats-text">
                  Total Days Completed:
                  <span className={`profile__day-number ${mode}`}> {journalConfig.total_days_completed}</span>
                </h2> */}
              </div>
              <div className={`profile__stats-container ${mode}`}>
                {/* <h2 className="profile__stats-text">
                  Last Day Completed:
                  <span className={`profile__day-number ${mode}`}> {journalConfig.last_day_completed}</span>
                </h2> */}
                <h2 className={`profile__sub-header ${mode}`}>Journal Settings</h2>
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
          <CustomPrompts />
          <div className={`profile__stats-text profile__toggle-container`}>
            Progress Audio:
            <div className={`profile__toggle-switch`}>
              <span
                onClick={() => handleToggle('progress_audio_enabled', true)}
                className={` profile__toggle-button profile__on-button ${
                  journalConfig.progress_audio_enabled ? 'profile__active' : 'profile__inactive'
                }`}
              >
                On
              </span>
              <span
                onClick={() => handleToggle('progress_audio_enabled', false)}
                className={` profile__toggle-button profile__off-button ${
                  journalConfig.progress_audio_enabled ? 'profile__inactive' : 'profile__active'
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
                onClick={() => handleToggle('timer_enabled', true)}
                className={` profile__toggle-button profile__on-button ${
                  journalConfig.timer_enabled ? 'profile__active' : 'profile__inactive'
                }`}
              >
                On
              </span>
              <span
                onClick={() => handleToggle('timer_enabled', false)}
                className={` profile__toggle-button profile__off-button ${
                  journalConfig.timer_enabled ? 'profile__inactive' : 'profile__active'
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
                onClick={() => handleToggle('wpm_enabled', true)}
                className={` profile__toggle-button profile__on-button ${
                  journalConfig.wpm_enabled ? 'profile__active' : 'profile__inactive'
                }`}
              >
                On
              </span>
              <span
                onClick={() => handleToggle('wpm_enabled', false)}
                className={` profile__toggle-button profile__off-button ${
                  journalConfig.wpm_enabled ? 'profile__inactive' : 'profile__active'
                }`}
              >
                Off
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  )
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  goal: state.wordCount.goal,
  mode: state.modes.mode,
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(logout()),
  loadUser: () => dispatch(loadUser()),
  toggleJournalConfigSetting: (settingName, isEnabled) => dispatch(toggleJournalConfigSetting(settingName, isEnabled)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
