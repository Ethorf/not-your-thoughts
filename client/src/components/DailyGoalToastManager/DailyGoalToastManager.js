import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ENTRY_TYPES } from '@constants/entryTypes'
import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer'
import { fetchAllWritingData } from '@redux/reducers/writingDataReducer'
import useDailyGoalCrossingToast from '@hooks/useDailyGoalCrossingToast'
import { GOAL_TOAST_IDS } from '@utils/dailyGoalToastHelpers'
import { toNonNegativeInt } from '@utils/writingStatsHelpers'

const { NODE } = ENTRY_TYPES

const DailyGoalToastManager = () => {
  const dispatch = useDispatch()
  const { journalConfig } = useSelector((state) => state.journalEntries)
  const { type: entryType } = useSelector((state) => state.currentEntry)
  const {
    stats: { nodesWordCountToday, nodesWritingTimeToday },
    wordsAdded,
    timeElapsed,
    sessionActive,
  } = useSelector((state) => state.writingData)

  useEffect(() => {
    dispatch(fetchJournalConfig())
    dispatch(fetchAllWritingData())
  }, [dispatch])

  const wordsGoal = toNonNegativeInt(journalConfig?.node_daily_words_goal ?? 400)
  const timeGoalMinutes = toNonNegativeInt(journalConfig?.node_daily_time_goal ?? 5)

  const pendingWords = sessionActive && entryType === NODE ? toNonNegativeInt(wordsAdded) : 0
  const pendingTimeSeconds = sessionActive && entryType === NODE ? toNonNegativeInt(timeElapsed) : 0

  const currentWordsToday = toNonNegativeInt(nodesWordCountToday) + pendingWords
  const currentTimeTodayMinutes = Math.floor((toNonNegativeInt(nodesWritingTimeToday) + pendingTimeSeconds) / 60)

  const goalsEnabled = Boolean(journalConfig)

  useDailyGoalCrossingToast({
    goalId: GOAL_TOAST_IDS.NODE_WORDS,
    current: currentWordsToday,
    goal: wordsGoal,
    message: 'Congrats! Node Words goal hit for today',
    enabled: goalsEnabled,
  })

  useDailyGoalCrossingToast({
    goalId: GOAL_TOAST_IDS.NODE_TIME,
    current: currentTimeTodayMinutes,
    goal: timeGoalMinutes,
    message: 'Congrats! Node Time goal hit for today',
    enabled: goalsEnabled,
  })

  return null
}

export default DailyGoalToastManager
