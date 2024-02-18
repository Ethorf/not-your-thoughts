const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
const authorize = require('../middleware/authorize')

// post /entries/add_entry
// Add a new journal entry

router.post('/add_journal_entry', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { content, total_time_taken, wpm, num_of_words } = req.body
  const type = 'journal'

  try {
    let newEntry = await pool.query(
      'INSERT INTO entries (user_id, content,type, total_time_taken, wpm, num_of_words) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, content, type, total_time_taken, wpm, num_of_words]
    )

    console.log('Entry created successfully!')
    return res.json({ newEntry })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all journal entries for a user

router.get('/journal_entries', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Retrieve all journal entries for the user with the provided user_id
    const allJournalEntries = await pool.query('SELECT * FROM entries WHERE user_id = $1 AND type = $2', [
      user_id,
      'journal',
    ])

    // Check if there are any entries found
    if (allJournalEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No journal entries found for this user' })
    }

    // If journal entries are found, return them
    res.json({ entries: allJournalEntries.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
