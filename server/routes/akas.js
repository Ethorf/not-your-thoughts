const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

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
    const remainingAkas = await pool.query('SELECT aka_value FROM title_akas WHERE entry_id = $1', [entryId])

    // Return the remaining aka values in the response
    res.json({ message: 'Aka value deleted successfully', akas: remainingAkas.rows })
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
