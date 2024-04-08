import React, { useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { toggleEditGoal, updateJournalGoal, setNewGoal } from '../../redux/actions/journalConfigActions.js'

import DefaultButton from '../Shared/DefaultButton/DefaultButton.js'

import '../../pages/Profile/Profile.scss'

function ProfileGoalEdit({ newGoal, toggleEditGoal, goalIsEditable, updateJournalGoal, setNewGoal, mode }) {
  const { journalConfig } = useSelector((state) => state.journalEntries)

  const [localGoalPreference, setLocalGoalPreference] = useState(journalConfig.goal_preference)

  const goalNum = (e) => {
    e.preventDefault()
    setNewGoal(Number(e.target.value))
  }

  const updateGoal = () => {
    if (localGoalPreference === 'words') {
      updateJournalGoal({ daily_words_goal: newGoal })
    } else if (localGoalPreference === 'time') {
      updateJournalGoal({ daily_time_goal: newGoal })
    }
    toggleEditGoal()
  }

  const cancelEditGoal = () => {
    toggleEditGoal()
  }

  useEffect(() => {
    updateJournalGoal({ goal_preference: localGoalPreference })
  }, [localGoalPreference, updateJournalGoal])

  return (
    <>
      <h2 className="profile__stats-text profile__toggle-container">
        Goal Preference:
        <div className={`profile__toggle-switch`}>
          <span
            onClick={() => {
              setLocalGoalPreference('words')
            }}
            className={` profile__toggle-button profile__on-button ${
              localGoalPreference === 'words' ? 'profile__active' : 'profile__inactive'
            }`}
          >
            Words
          </span>
          <span
            onClick={() => {
              setLocalGoalPreference('time')
            }}
            className={` profile__toggle-button profile__off-button ${
              localGoalPreference !== 'time' ? 'profile__inactive' : 'profile__active'
            }`}
          >
            Time
          </span>
        </div>
      </h2>
      <h2 className="profile__stats-text profile__edit-container">
        Daily {localGoalPreference === 'words' ? 'Words' : 'Time'} Goal :
        {goalIsEditable ? (
          localGoalPreference === 'words' ? (
            <div className={`profile__goal-edit-buttons-container`}>
              <input
                className={`profile__goal-input ${mode}`}
                onChange={goalNum}
                type="number"
                defaultValue={journalConfig.daily_words_goal}
              />
              <DefaultButton onClick={updateGoal}>Save</DefaultButton>
              <DefaultButton onClick={cancelEditGoal}>Cancel</DefaultButton>
            </div>
          ) : (
            <div className={`profile__goal-edit-buttons-container`}>
              <input
                className={`profile__goal-input ${mode}`}
                onChange={goalNum}
                type="number"
                defaultValue={journalConfig.daily_time_goal}
              />
              Minute{journalConfig.daily_time_goal >= 2 ? 's' : ''}
              <DefaultButton onClick={updateGoal}>Save</DefaultButton>
              <DefaultButton onClick={cancelEditGoal}>Cancel</DefaultButton>
            </div>
          )
        ) : (
          <>
            <div className={`profile__day-number ${mode}`}>
              {localGoalPreference === 'words'
                ? journalConfig.daily_words_goal
                : `${journalConfig.daily_time_goal} minute${journalConfig.daily_time_goal >= 2 ? 's' : ''}`}
              <DefaultButton onClick={toggleEditGoal}>Edit</DefaultButton>
            </div>
          </>
        )}
      </h2>
    </>
  )
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  goal: state.wordCount.goal,
  newGoal: state.wordCount.newGoal,
  goalIsEditable: state.wordCount.goalIsEditable,
  mode: state.modes.mode,
})

export default connect(mapStateToProps, { toggleEditGoal, updateJournalGoal, setNewGoal })(ProfileGoalEdit)
