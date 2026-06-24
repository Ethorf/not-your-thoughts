const animationStartTimesById = new Map()

/**
 * Returns a negative animation-delay so the shine loop continues from the same
 * phase after React remounts the element (e.g. on each editor keystroke).
 *
 * @param {string|undefined} animationId - Stable id scoped per entry/candidate/occurrence
 * @param {number} durationSec - Must match the element's animation duration
 * @returns {string|undefined}
 */
export const getShinyTextAnimationDelay = (animationId, durationSec) => {
  if (!animationId || !durationSec) {
    return undefined
  }

  if (!animationStartTimesById.has(animationId)) {
    animationStartTimesById.set(animationId, performance.now())
  }

  const elapsedSec = (performance.now() - animationStartTimesById.get(animationId)) / 1000
  const delaySec = -(elapsedSec % durationSec)

  return `${delaySec}s`
}

/**
 * Drop cached animation phases when leaving an entry (or all entries).
 *
 * @param {string|number|undefined} entryId
 */
export const clearShinyTextAnimationStarts = (entryId) => {
  if (entryId == null) {
    animationStartTimesById.clear()
    return
  }

  const prefix = `${entryId}:`
  for (const key of animationStartTimesById.keys()) {
    if (key.startsWith(prefix)) {
      animationStartTimesById.delete(key)
    }
  }
}
