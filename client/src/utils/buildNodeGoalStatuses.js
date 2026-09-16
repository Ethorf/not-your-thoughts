import { toNonNegativeInt } from '@utils/writingStatsHelpers'

/**
 * Build the list of daily goal statuses shown in the node goals sidebar.
 *
 * @returns {Array<{ id: string, section: string, label: string, current: number, goal: number, unit: string, complete: boolean }>}
 */
export const buildNodeGoalStatuses = ({
  journalConfig,
  wordCount = 0,
  nodesWordCountToday = 0,
  nodesWritingTimeToday = 0,
  journalWordCountToday = 0,
  journalWritingTimeToday = 0,
  wordsAdded = 0,
  timeElapsed = 0,
  sessionActive = false,
}) => {
  if (!journalConfig) {
    return []
  }

  const goals = []

  const perNodeWordsGoal = toNonNegativeInt(journalConfig.node_word_count_goal ?? 500)
  const currentNodeWords = toNonNegativeInt(wordCount)
  if (perNodeWordsGoal > 0) {
    goals.push({
      id: 'this-node-words',
      section: 'thisNode',
      label: 'Words',
      current: currentNodeWords,
      goal: perNodeWordsGoal,
      unit: 'words',
      complete: currentNodeWords >= perNodeWordsGoal,
    })
  }

  const wordsGoal = toNonNegativeInt(journalConfig.node_daily_words_goal ?? 400)
  const timeGoalMinutes = toNonNegativeInt(journalConfig.node_daily_time_goal ?? 5)
  const pendingWords = sessionActive ? toNonNegativeInt(wordsAdded) : 0
  const pendingTimeSeconds = sessionActive ? toNonNegativeInt(timeElapsed) : 0
  const currentWordsToday = toNonNegativeInt(nodesWordCountToday) + pendingWords
  const currentTimeTodayMinutes = Math.floor(
    (toNonNegativeInt(nodesWritingTimeToday) + pendingTimeSeconds) / 60
  )

  goals.push({
    id: 'nodes-words',
    section: 'nodesToday',
    label: 'Words',
    current: currentWordsToday,
    goal: wordsGoal,
    unit: 'words',
    complete: wordsGoal > 0 && currentWordsToday >= wordsGoal,
  })

  goals.push({
    id: 'nodes-time',
    section: 'nodesToday',
    label: 'Time',
    current: currentTimeTodayMinutes,
    goal: timeGoalMinutes,
    unit: 'min',
    complete: timeGoalMinutes > 0 && currentTimeTodayMinutes >= timeGoalMinutes,
  })

  const journalUsesWordsGoal = journalConfig.journal_goal_preference !== 'time'
  if (journalUsesWordsGoal) {
    const journalWordsGoal = toNonNegativeInt(journalConfig.daily_words_goal ?? 400)
    const journalWordsToday = toNonNegativeInt(journalWordCountToday)
    goals.push({
      id: 'journal-words',
      section: 'journals',
      label: 'Words',
      current: journalWordsToday,
      goal: journalWordsGoal,
      unit: 'words',
      complete: journalWordsGoal > 0 && journalWordsToday >= journalWordsGoal,
    })
  } else {
    const journalTimeGoalMinutes = toNonNegativeInt(journalConfig.daily_time_goal ?? 5)
    const journalTimeTodayMinutes = Math.floor(toNonNegativeInt(journalWritingTimeToday) / 60)
    goals.push({
      id: 'journal-time',
      section: 'journals',
      label: 'Time',
      current: journalTimeTodayMinutes,
      goal: journalTimeGoalMinutes,
      unit: 'min',
      complete: journalTimeGoalMinutes > 0 && journalTimeTodayMinutes >= journalTimeGoalMinutes,
    })
  }

  return goals
}
