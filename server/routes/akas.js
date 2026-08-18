const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')
const { buildAkaSuggestionsFromTitle } = require('../utils/akaSuggestions')

// Route to fetch synonym-based AKA suggestions for a node's title
router.get('/:entryId/suggestions', authorize, async (req, res) => {
  const { entryId } = req.params
  const userId = req.user.id

  try {
    const entryResult = await pool.query('SELECT title FROM entries WHERE id = $1 AND user_id = $2', [entryId, userId])

    if (!entryResult.rows.length) {
      return res.status(404).json({ msg: 'Entry not found' })
    }

    const { title } = entryResult.rows[0]
    const akaResult = await pool.query('SELECT aka_value FROM title_akas WHERE entry_id = $1', [entryId])
    const existingAkas = akaResult.rows.map((row) => row.aka_value)

    const suggestions = await buildAkaSuggestionsFromTitle({ title, existingAkas })

    res.json({ suggestions, title })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Route to add aka values to an entry
router.post('/:entryId/add_aka', authorize, async (req, res) => {
  const { entryId } = req.params
  const { aka } = req.body

  try {
    // Insert the new aka value into the title_akas table
    const newAka = await pool.query('INSERT INTO title_akas (entry_id, aka_value) VALUES ($1, $2) RETURNING *', [
      entryId,
      aka,
    ])

    res.json({ aka: newAka.rows[0] })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Route to delete a single aka value from an entry
router.delete('/:entryId/akas/:akaId', authorize, async (req, res) => {
  const { entryId, akaId } = req.params

  try {
    // Delete the aka value
    await pool.query('DELETE FROM title_akas WHERE entry_id = $1 AND id = $2', [entryId, akaId])

    // Fetch the remaining aka values after deletion
    const remainingAkas = await pool.query('SELECT * FROM title_akas WHERE entry_id = $1', [entryId])

    // Return the remaining aka values in the response
    res.json({ message: 'Aka value deleted successfully', akas: remainingAkas.rows })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Promote an AKA to the node's canon title; demote the previous title to an AKA
router.post('/:entryId/set_canon_title', authorize, async (req, res) => {
  const { entryId } = req.params
  const { akaId } = req.body
  const userId = req.user.id

  if (!akaId) {
    return res.status(400).json({ message: 'akaId is required' })
  }

  try {
    const entryResult = await pool.query('SELECT id, title FROM entries WHERE id = $1 AND user_id = $2', [
      entryId,
      userId,
    ])

    if (!entryResult.rows.length) {
      return res.status(404).json({ message: 'Entry not found' })
    }

    const previousTitle = entryResult.rows[0].title || ''

    const akaResult = await pool.query('SELECT id, aka_value FROM title_akas WHERE entry_id = $1 AND id = $2', [
      entryId,
      akaId,
    ])

    if (!akaResult.rows.length) {
      return res.status(404).json({ message: 'AKA not found' })
    }

    const newTitle = akaResult.rows[0].aka_value

    if (!newTitle || !String(newTitle).trim()) {
      return res.status(400).json({ message: 'AKA value is empty' })
    }

    if (previousTitle && previousTitle.toLowerCase() === newTitle.toLowerCase()) {
      return res.status(400).json({ message: 'AKA is already the canon title' })
    }

    const titleConflict = await pool.query('SELECT id FROM entries WHERE title = $1 AND id != $2', [newTitle, entryId])
    if (titleConflict.rows.length > 0) {
      return res.status(400).json({ message: 'Title already exists' })
    }

    await pool.query('UPDATE entries SET title = $1 WHERE id = $2 AND user_id = $3', [newTitle, entryId, userId])
    await pool.query('DELETE FROM title_akas WHERE entry_id = $1 AND id = $2', [entryId, akaId])

    if (previousTitle && previousTitle.trim()) {
      const existingAka = await pool.query(
        'SELECT id FROM title_akas WHERE entry_id = $1 AND LOWER(aka_value) = LOWER($2)',
        [entryId, previousTitle]
      )

      if (!existingAka.rows.length) {
        await pool.query('INSERT INTO title_akas (entry_id, aka_value) VALUES ($1, $2)', [entryId, previousTitle])
      }
    }

    const remainingAkas = await pool.query('SELECT * FROM title_akas WHERE entry_id = $1 ORDER BY id ASC', [entryId])

    res.json({ title: newTitle, akas: remainingAkas.rows, previousTitle })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Route to fetch all aka values for an entry
router.get('/:entryId/akas', authorize, async (req, res) => {
  const { entryId } = req.params

  try {
    const result = await pool.query('SELECT * FROM title_akas WHERE entry_id = $1', [entryId])
    res.json({ akas: result.rows })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})
module.exports = router
