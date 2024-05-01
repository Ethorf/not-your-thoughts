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
    const newAka = await pool.query('INSERT INTO title_akas (entry_id, aka_value) VALUES ($1, $2) RETURNING id', [
      entryId,
      aka,
    ])

    res.json({ id: newAka.rows[0].id, aka })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Route to delete a single aka value from an entry
router.delete('/:entryId/akas/:akaId', authorize, async (req, res) => {
  const { entryId, akaId } = req.params

  try {
    await pool.query('DELETE FROM title_akas WHERE entry_id = $1 AND id = $2', [entryId, akaId])

    res.json({ message: 'Aka value deleted successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Route to delete all aka values from an entry
router.delete('/:entryId/akas', authorize, async (req, res) => {
  const { entryId } = req.params

  try {
    await pool.query('DELETE FROM title_akas WHERE entry_id = $1', [entryId])

    res.json({ message: 'Aka values deleted successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// Route to fetch all aka values for an entry
router.get('/:entryId/akas', authorize, async (req, res) => {
  const { entryId } = req.params

  try {
    const result = await pool.query('SELECT aka_value FROM title_akas WHERE entry_id = $1', [entryId])
    const akas = result.rows.map((row) => row.aka_value)
    console.log('akas is:')
    console.log(akas)
    res.json({ akas })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
