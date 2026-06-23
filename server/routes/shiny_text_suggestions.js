const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

const entryBelongsToUser = async (entryId, userId) => {
  const result = await pool.query('SELECT id FROM entries WHERE id = $1 AND user_id = $2', [entryId, userId])
  return result.rows.length > 0
}

// GET dismissals for an entry (titles the user chose not to highlight as shiny suggestions)
router.get('/:entryId/dismissals', authorize, async (req, res) => {
  const { entryId } = req.params
  const { id: userId } = req.user

  try {
    const ownsEntry = await entryBelongsToUser(entryId, userId)
    if (!ownsEntry) {
      return res.status(403).json({ msg: 'Not authorized to access this entry' })
    }

    const result = await pool.query(
      `SELECT id, entry_id, suggested_entry_id, created_at
       FROM shiny_text_dismissals
       WHERE entry_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [entryId, userId]
    )

    res.json({ dismissals: result.rows })
  } catch (error) {
    console.error('Error fetching shiny text dismissals:', error.message)
    res.status(500).json({ msg: 'Server error' })
  }
})

// POST dismiss a shiny text suggestion for an entry
router.post('/:entryId/dismissals', authorize, async (req, res) => {
  const { entryId } = req.params
  const { suggested_entry_id: suggestedEntryId } = req.body
  const { id: userId } = req.user

  if (!suggestedEntryId) {
    return res.status(400).json({ msg: 'suggested_entry_id is required' })
  }

  if (String(entryId) === String(suggestedEntryId)) {
    return res.status(400).json({ msg: 'Cannot dismiss a suggestion to the same entry' })
  }

  try {
    const ownsEntry = await entryBelongsToUser(entryId, userId)
    if (!ownsEntry) {
      return res.status(403).json({ msg: 'Not authorized to modify this entry' })
    }

    const ownsSuggestedEntry = await entryBelongsToUser(suggestedEntryId, userId)
    if (!ownsSuggestedEntry) {
      return res.status(403).json({ msg: 'Suggested entry not found' })
    }

    const result = await pool.query(
      `INSERT INTO shiny_text_dismissals (entry_id, suggested_entry_id, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (entry_id, suggested_entry_id) DO UPDATE
       SET created_at = shiny_text_dismissals.created_at
       RETURNING id, entry_id, suggested_entry_id, created_at`,
      [entryId, suggestedEntryId, userId]
    )

    res.json({ dismissal: result.rows[0] })
  } catch (error) {
    console.error('Error dismissing shiny text suggestion:', error.message)
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router
