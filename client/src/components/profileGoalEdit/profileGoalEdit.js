import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Button } from '@material-ui/core'
import { toggleEditGoal, updateJournalGoal, setNewGoal } from '../../redux/actions/journalConfigActions'

import '../../pages/Profile/profile.scss'

function ProfileGoalEdit({
  newGoal,
  toggleEditGoal,
  goalIsEditable,
  updateJournalGoal,
  setNewGoal,
  mode,
  auth: { user },
  journalConfig,
}) {
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
  }, [localGoalPreference])

  // TODO still may need to do some updating here so that we can see the new values as soon as they happen
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
              <Button onClick={updateGoal} className="profile__goal-editable-button">
                Save
              </Button>
              <Button onClick={cancelEditGoal} className="profile__goal-editable-button profile__goal-cancel-button">
                Cancel
              </Button>
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
              <Button onClick={updateGoal} className="profile__goal-editable-button">
                Save
              </Button>
              <Button onClick={cancelEditGoal} className="profile__goal-editable-button profile__goal-cancel-button">
                Cancel
              </Button>
            </div>
          )
        ) : (
          <>
            <div className={`profile__day-number ${mode}`}>
              {localGoalPreference === 'words'
                ? journalConfig.daily_words_goal
                : `${journalConfig.daily_time_goal} minute${journalConfig.daily_time_goal >= 2 ? 's' : ''}`}
              <Button onClick={toggleEditGoal}>Edit</Button>
            </div>
          </>
        )}
      </h2>
    </>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  goal: state.wordCount.goal,
  newGoal: state.wordCount.newGoal,
  goalIsEditable: state.wordCount.goalIsEditable,
  mode: state.modes.mode,
  journalConfig: state.entries.journalConfig,
})

export default connect(mapStateToProps, { toggleEditGoal, updateJournalGoal, setNewGoal })(ProfileGoalEdit)
