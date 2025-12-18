// Utility to map short public user identifiers (aliases) to full UUIDs
// This lets URLs use readable ids like `ethorf` instead of the full UUID.

// Map of supported public aliases → real user UUIDs
const PUBLIC_USER_ALIASES = {
  ethorf: '4fd36f0e-9159-4561-af4e-e5841994c873',
}

/**
 * Resolves a potentially-short user identifier to the canonical public userId
 * used by the backend.
 *
 * - If the value matches a known alias (e.g. "ethorf"), returns the mapped UUID.
 * - If the value already looks like a UUID, returns it unchanged.
 * - Otherwise returns the original value (for future flexibility).
 *
 * @param {string|null|undefined} userId
 * @returns {string|null|undefined}
 */
export const resolvePublicUserId = (userId) => {
  if (!userId || typeof userId !== 'string') return userId

  const trimmed = userId.trim()
  const lower = trimmed.toLowerCase()

  // Alias mapping (e.g. "ethorf" → UUID)
  if (PUBLIC_USER_ALIASES[lower]) {
    return PUBLIC_USER_ALIASES[lower]
  }

  // If it already looks like a UUID, just pass it through
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(trimmed)) {
    return trimmed
  }

  // Fallback: return the original value unchanged
  return trimmed
}


