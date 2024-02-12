import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Button } from '@material-ui/core'
import { toggleEditGoal, changeJournalGoal, setNewGoal } from '../../redux/actions/journalConfigActions'
import { toggleUserSetting } from '../../redux/actions/authActions'

import '../../pages/profile/profile.scss'

function ProfileGoalEdit({
  newGoal,
  toggleEditGoal,
  goalIsEditable,
  toggleUserSetting,
  changeJournalGoal,
  setNewGoal,
  mode,
  auth: { user },
}) {
  const [localGoalPreference, setLocalGoalPreference] = useState(user.goalPreference)

  const goalNum = (e) => {
    e.preventDefault()
    setNewGoal(e.target.value)
  }

  const saveGoal = (type) => {
    changeJournalGoal(newGoal, type)
    changeJournalGoal(newGoal, type)
    toggleEditGoal()
  }

  const cancelEditGoal = () => {
    toggleEditGoal()
  }
  const toggleGoalPreference = () => {
    if (localGoalPreference === 'words') {
      setLocalGoalPreference('time')
    } else {
      setLocalGoalPreference('words')
    }
    toggleUserSetting('Goal')
  }
  return (
    <>
      <h2 className="profile__stats-text profile__toggle-container">
        Goal Preference:{' '}
        <div className={`profile__toggle-switch`}>
          <span
            onClick={toggleGoalPreference}
            className={` profile__toggle-button profile__on-button ${
              localGoalPreference === 'words' ? 'profile__active' : 'profile__inactive'
            }`}
          >
            Words
          </span>
          <span
            onClick={toggleGoalPreference}
            className={` profile__toggle-button profile__off-button ${
              localGoalPreference !== 'time' ? 'profile__inactive' : 'profile__active'
            }`}
          >
            Time
          </span>{' '}
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
                defaultValue={user.dailyWordsGoal}
              ></input>
              <Button onClick={() => saveGoal('Words')} className="profile__goal-editable-button">
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
                defaultValue={user.dailyTimeGoal}
              ></input>{' '}
              Minute{user.dailyTimeGoal >= 2 ? 's' : ''}
              <Button onClick={() => saveGoal('Time')} className="profile__goal-editable-button">
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
              {' '}
              {localGoalPreference === 'words'
                ? user.dailyWordsGoal
                : `${user.dailyTimeGoal} minute${user.dailyTimeGoal >= 2 ? 's' : ''}`}
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
})

export default connect(mapStateToProps, { toggleEditGoal, changeJournalGoal, setNewGoal, toggleUserSetting })(
  ProfileGoalEdit
)
