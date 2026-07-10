export const getTodayDateKey = () => new Date().toISOString().slice(0, 10)

export const getGoalToastStorageKey = (goalId) => `nyt-goal-toast-${goalId}-${getTodayDateKey()}`

export const hasGoalToastBeenShown = (goalId) => localStorage.getItem(getGoalToastStorageKey(goalId)) === '1'

export const markGoalToastShown = (goalId) => {
  localStorage.setItem(getGoalToastStorageKey(goalId), '1')
}

export const GOAL_TOAST_IDS = {
  NODE_WORDS: 'node-words',
  NODE_TIME: 'node-time',
}
