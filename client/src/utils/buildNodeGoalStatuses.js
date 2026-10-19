import { toNonNegativeInt } from '@utils/writingStatsHelpers'
import { ENTRY_TYPES } from '@constants/entryTypes'

/**
 * Build the list of daily goal statuses shown in the goals sidebar.
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
  entryType = ENTRY_TYPES.NODE,
}) => {
  if (!journalConfig) {
    return []
  }

  const goals = []
  const isJournalContext = entryType === ENTRY_TYPES.JOURNAL
  const pendingWords = sessionActive ? toNonNegativeInt(wordsAdded) : 0
  const pendingTimeSeconds = sessionActive ? toNonNegativeInt(timeElapsed) : 0

  const perNodeWordsGoal = toNonNegativeInt(journalConfig.node_word_count_goal ?? 500)
  if (!isJournalContext && perNodeWordsGoal > 0) {
    const currentNodeWords = toNonNegativeInt(wordCount)
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
  // Only count an active typing session toward Nodes Today when editing a node.
  const nodePendingWords = isJournalContext ? 0 : pendingWords
  const nodePendingTimeSeconds = isJournalContext ? 0 : pendingTimeSeconds
  const currentWordsToday = toNonNegativeInt(nodesWordCountToday) + nodePendingWords
  const currentTimeTodayMinutes = Math.floor(
    (toNonNegativeInt(nodesWritingTimeToday) + nodePendingTimeSeconds) / 60
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
    // While editing today's journal, prefer the live editor word count.
    const journalWordsToday = isJournalContext
      ? Math.max(toNonNegativeInt(journalWordCountToday), toNonNegativeInt(wordCount))
      : toNonNegativeInt(journalWordCountToday)
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
    const journalPendingTimeSeconds = isJournalContext ? pendingTimeSeconds : 0
    const journalTimeTodayMinutes = Math.floor(
      (toNonNegativeInt(journalWritingTimeToday) + journalPendingTimeSeconds) / 60
    )
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
