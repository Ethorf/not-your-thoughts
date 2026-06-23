/**
 * Coerce an entry id from URL params, Redux, or API payloads into a finite number.
 * Returns null for missing/invalid values (including "[object Object]").
 */
export const normalizeEntryId = (value) => {
  if (value == null) {
    return null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '[object Object]' || trimmed === 'undefined' || trimmed === 'null') {
      return null
    }
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (typeof value === 'object' && value.id != null) {
    return normalizeEntryId(value.id)
  }

  return null
}

export const entryIdsMatch = (left, right) => {
  const normalizedLeft = normalizeEntryId(left)
  const normalizedRight = normalizeEntryId(right)
  if (normalizedLeft == null || normalizedRight == null) {
    return false
  }
  return normalizedLeft === normalizedRight
}
