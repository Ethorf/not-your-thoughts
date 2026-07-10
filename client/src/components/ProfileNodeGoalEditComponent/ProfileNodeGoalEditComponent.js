import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import { updateJournalGoal } from '@redux/actions/journalConfigActions'
import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer'

import '../../pages/ProfilePage/ProfilePage.scss'
import styles from './ProfileNodeGoalEditComponent.module.scss'

const ProfileNodeGoalEdit = () => {
  const dispatch = useDispatch()
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const {
    stats: { nodesWordCountToday, nodesWritingTimeToday },
  } = useSelector((state) => state.writingData)

  const [localWordsGoal, setLocalWordsGoal] = useState(journalConfig?.node_daily_words_goal ?? 400)
  const [localTimeGoal, setLocalTimeGoal] = useState(journalConfig?.node_daily_time_goal ?? 5)
  const [wordsGoalEditable, setWordsGoalEditable] = useState(false)
  const [timeGoalEditable, setTimeGoalEditable] = useState(false)

  useEffect(() => {
    if (!journalConfig) return
    setLocalWordsGoal(journalConfig.node_daily_words_goal ?? 400)
    setLocalTimeGoal(journalConfig.node_daily_time_goal ?? 5)
  }, [journalConfig])

  const saveWordsGoal = async () => {
    await dispatch(updateJournalGoal({ node_daily_words_goal: Number(localWordsGoal) }))
    await dispatch(fetchJournalConfig())
    setWordsGoalEditable(false)
  }

  const saveTimeGoal = async () => {
    await dispatch(updateJournalGoal({ node_daily_time_goal: Number(localTimeGoal) }))
    await dispatch(fetchJournalConfig())
    setTimeGoalEditable(false)
  }

  const wordsGoal = journalConfig?.node_daily_words_goal ?? 400
  const timeGoalMinutes = journalConfig?.node_daily_time_goal ?? 5
  const timeGoalSeconds = timeGoalMinutes * 60

  return (
    <>
      <h2 className="profile__stats-text profile__edit-container">
        Daily Words Goal:
        {wordsGoalEditable ? (
          <div className="profile__goal-edit-buttons-container">
            <input
              className={styles.goalInput}
              onChange={(event) => setLocalWordsGoal(event.target.value)}
              type="number"
              value={localWordsGoal}
            />
            <DefaultButton onClick={saveWordsGoal}>Save</DefaultButton>
            <DefaultButton onClick={() => setWordsGoalEditable(false)}>Cancel</DefaultButton>
          </div>
        ) : (
          <div className="profile__day-number">
            {wordsGoal}
            <DefaultButton onClick={() => setWordsGoalEditable(true)}>Edit</DefaultButton>
          </div>
        )}
      </h2>
      <p className={styles.progressText}>
        Today: {nodesWordCountToday} / {wordsGoal} words
      </p>

      <h2 className="profile__stats-text profile__edit-container">
        Daily Time Goal:
        {timeGoalEditable ? (
          <div className="profile__goal-edit-buttons-container">
            <input
              className={styles.goalInput}
              onChange={(event) => setLocalTimeGoal(event.target.value)}
              type="number"
              value={localTimeGoal}
            />
            Minute{Number(localTimeGoal) >= 2 ? 's' : ''}
            <DefaultButton onClick={saveTimeGoal}>Save</DefaultButton>
            <DefaultButton onClick={() => setTimeGoalEditable(false)}>Cancel</DefaultButton>
          </div>
        ) : (
          <div className="profile__day-number">
            {timeGoalMinutes} minute{timeGoalMinutes >= 2 ? 's' : ''}
            <DefaultButton onClick={() => setTimeGoalEditable(true)}>Edit</DefaultButton>
          </div>
        )}
      </h2>
      <p className={styles.progressText}>
        Today: {Math.floor(nodesWritingTimeToday / 60)} / {timeGoalMinutes} minutes typed
        {nodesWritingTimeToday >= timeGoalSeconds ? ' — goal reached!' : ''}
      </p>
    </>
  )
}

export default ProfileNodeGoalEdit
