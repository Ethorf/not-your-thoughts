import React, { useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { toggleEditGoal, updateJournalGoal, setNewGoal } from '../../redux/actions/journalConfigActions.js'

import DefaultButton from '../Shared/DefaultButton/DefaultButton.js'

import '../../pages/ProfilePage/ProfilePage.scss'
import styles from './ProfileGoalEditComponent.module.scss'

function ProfileGoalEdit({ newGoal, toggleEditGoal, goalIsEditable, updateJournalGoal, setNewGoal, mode }) {
  const {
    journalConfig: { journal_goal_preference, daily_words_goal, daily_time_goal },
  } = useSelector((state) => state.journalEntries)
  const [localGoalPreference, setLocalGoalPreference] = useState(journal_goal_preference)
  const [localWordsGoal, setLocalWordsGoal] = useState(daily_words_goal)
  const [localTimeGoal, setLocalTimeGoal] = useState(daily_time_goal)

  const handleWordsGoalNum = (e) => {
    e.preventDefault()
    setLocalWordsGoal(e.target.value)
    setNewGoal(Number(e.target.value))
  }

  const handleTimeGoalNum = (e) => {
    e.preventDefault()
    setLocalTimeGoal(e.target.value)
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

  useEffect(() => {
    updateJournalGoal({ journal_goal_preference: localGoalPreference })
  }, [localGoalPreference, updateJournalGoal])

  // TODO it would be really nice to update this file with a better pattern as it is clearly a cluttered mess
  // But it's extremely lo-pri for now since it works

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
              <input className={styles.timeInput} onChange={handleWordsGoalNum} type="number" value={localWordsGoal} />
              <DefaultButton onClick={updateGoal}>Save</DefaultButton>
              <DefaultButton onClick={toggleEditGoal}>Cancel</DefaultButton>
            </div>
          ) : (
            <div className={`profile__goal-edit-buttons-container`}>
              <input className={styles.timeInput} onChange={handleTimeGoalNum} value={localTimeGoal} type="number" />
              Minute{localTimeGoal >= 2 ? 's' : ''}
              <DefaultButton onClick={updateGoal}>Save</DefaultButton>
              <DefaultButton onClick={toggleEditGoal}>Cancel</DefaultButton>
            </div>
          )
        ) : (
          <>
            <div className={`profile__day-number ${mode}`}>
              {localGoalPreference === 'words'
                ? localWordsGoal
                : `${localTimeGoal} minute${localTimeGoal >= 2 ? 's' : ''}`}
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
