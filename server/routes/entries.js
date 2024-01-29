const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
const jwtGenerator = require('../utils/jwtGenerator')
const authorize = require('../middleware/authorize')

// post /auth/register
// Register a new user
// ?? Should we use use the authorize jwt middleware here?

router.post('/add_entry', validInfo, async (req, res) => {
  const { user_id, content } = req.body

  try {
    let newEntry = await pool.query('INSERT INTO entries (user_id, content) VALUES ($1, $2) RETURNING *', [
      user_id,
      content,
    ])

    console.log('Entry created successfully!')
    return res.json({ newEntry })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
