import React, { useEffect, useState } from 'react'
import { connect, useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer.js'
import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'
import { toggleJournalConfigSetting } from '@redux/actions/journalConfigActions.js'
import { PROFILE_SETTINGS_TABS } from '@constants/profileSettingsTabs'

import ProfileGoalEdit from '@components/ProfileGoalEditComponent/ProfileGoalEditComponent.js'
import ProfileNodeGoalEdit from '@components/ProfileNodeGoalEditComponent/ProfileNodeGoalEditComponent.js'
import { WritingDataDisplay } from '@components/WritingDataDisplay/WritingDataDisplay.js'
import CustomPromptsSection from '@components/CustomPromptsSection/CustomPromptsSection.js'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton.js'
import Spinner from '@components/Shared/Spinner/Spinner.js'

import './ProfilePage.scss'
import '../../styles/rubberDucky.scss'

const { ALL, JOURNAL, NODE } = PROFILE_SETTINGS_TABS

const ProfileToggle = ({ label, enabled, onEnable, onDisable }) => (
  <div className="profile__stats-text profile__toggle-container">
    {label}:
    <div className="profile__toggle-switch">
      <span
        onClick={onEnable}
        className={`profile__toggle-button profile__on-button ${enabled ? 'profile__active' : 'profile__inactive'}`}
      >
        On
      </span>
      <span
        onClick={onDisable}
        className={`profile__toggle-button profile__off-button ${enabled ? 'profile__inactive' : 'profile__active'}`}
      >
        Off
      </span>
    </div>
  </div>
)

const Profile = ({ auth: { user }, mode, toggleJournalConfigSetting }) => {
  const dispatch = useDispatch()
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const [activeTab, setActiveTab] = useState(ALL)

  const [localProgressAudioEnabled, setLocalProgressAudioEnabled] = useState(journalConfig?.progress_audio_enabled)
  const [localTimerEnabled, setLocalTimerEnabled] = useState(journalConfig?.timer_enabled)
  const [localWPMEnabled, setLocalWPMEnabled] = useState(journalConfig?.wpm_display_enabled)

  useEffect(() => {
    dispatch(fetchJournalConfig())
    dispatch(fetchAllWritingData())
  }, [dispatch])

  useEffect(() => {
    if (!journalConfig) return
    setLocalProgressAudioEnabled(journalConfig.progress_audio_enabled)
    setLocalTimerEnabled(journalConfig.timer_enabled)
    setLocalWPMEnabled(journalConfig.wpm_display_enabled)
  }, [journalConfig])

  const handleProgressAudioToggle = (isEnabled) => {
    setLocalProgressAudioEnabled(isEnabled)
    toggleJournalConfigSetting('progress_audio_enabled', isEnabled)
  }

  const handleTimerToggle = (isEnabled) => {
    setLocalTimerEnabled(isEnabled)
    toggleJournalConfigSetting('timer_enabled', isEnabled)
  }

  const handleWPMToggle = (isEnabled) => {
    setLocalWPMEnabled(isEnabled)
    toggleJournalConfigSetting('wpm_display_enabled', isEnabled)
  }

  if (!journalConfig) {
    return (
      <div className={`profile ${mode}`}>
        <Spinner />
      </div>
    )
  }

  return (
    <div className={`profile ${mode}`}>
      <header className={`profile__header ${mode}`}>User Profile</header>
      <h2 className={`profile__user ${mode}`}>{user.name}</h2>

      <div className="profile__tab-row">
        <DefaultButton isSelected={activeTab === ALL} onClick={() => setActiveTab(ALL)}>
          All
        </DefaultButton>
        <DefaultButton isSelected={activeTab === JOURNAL} onClick={() => setActiveTab(JOURNAL)}>
          Journal
        </DefaultButton>
        <DefaultButton isSelected={activeTab === NODE} onClick={() => setActiveTab(NODE)}>
          Node
        </DefaultButton>
      </div>

      {activeTab === ALL && (
        <>
          <h2 className={`profile__sub-header ${mode}`}>Stats</h2>
          <WritingDataDisplay scope={ALL} />
          <h2 className={`profile__sub-header ${mode}`}>General Settings</h2>
          <ProfileToggle
            label="Progress Audio"
            enabled={localProgressAudioEnabled}
            onEnable={() => handleProgressAudioToggle(true)}
            onDisable={() => handleProgressAudioToggle(false)}
          />
          <ProfileToggle
            label="Timer"
            enabled={localTimerEnabled}
            onEnable={() => handleTimerToggle(true)}
            onDisable={() => handleTimerToggle(false)}
          />
          <ProfileToggle
            label="WPM readout"
            enabled={localWPMEnabled}
            onEnable={() => handleWPMToggle(true)}
            onDisable={() => handleWPMToggle(false)}
          />
        </>
      )}

      {activeTab === JOURNAL && (
        <>
          <h2 className={`profile__sub-header ${mode}`}>Journal Settings</h2>
          <ProfileGoalEdit />
          <h2 className={`profile__sub-header ${mode}`}>Journal Stats</h2>
          <WritingDataDisplay scope={JOURNAL} />
          <CustomPromptsSection />
        </>
      )}

      {activeTab === NODE && (
        <>
          <h2 className={`profile__sub-header ${mode}`}>Node Settings</h2>
          <ProfileNodeGoalEdit />
          <h2 className={`profile__sub-header ${mode}`}>Node Stats</h2>
          <WritingDataDisplay scope={NODE} />
        </>
      )}
    </div>
  )
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  toggleJournalConfigSetting: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  mode: state.modes.mode,
})

const mapDispatchToProps = (dispatch) => ({
  toggleJournalConfigSetting: (settingName, isEnabled) => dispatch(toggleJournalConfigSetting(settingName, isEnabled)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
