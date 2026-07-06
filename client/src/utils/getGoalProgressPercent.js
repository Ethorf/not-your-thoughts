export const getGoalProgressPercent = (current, goal) => {
  const safeCurrent = Math.max(0, Number(current) || 0)
  const safeGoal = Math.max(0, Number(goal) || 0)
  if (safeGoal <= 0) return 0
  return Math.min(100, Math.round((safeCurrent / safeGoal) * 100))
}
