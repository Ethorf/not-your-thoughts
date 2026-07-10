import { useEffect, useRef } from 'react'

import { showToast } from '@utils/toast'
import { hasGoalToastBeenShown, markGoalToastShown } from '@utils/dailyGoalToastHelpers'

const useDailyGoalCrossingToast = ({ goalId, current, goal, message, enabled = true }) => {
  const previousValueRef = useRef(null)

  useEffect(() => {
    if (!enabled || goal <= 0) {
      return
    }

    const previousValue = previousValueRef.current
    const crossedGoal = previousValue !== null && previousValue < goal && current >= goal

    if (crossedGoal && !hasGoalToastBeenShown(goalId)) {
      showToast(message, 'success')
      markGoalToastShown(goalId)
    }

    previousValueRef.current = current
  }, [current, enabled, goal, goalId, message])
}

export default useDailyGoalCrossingToast
