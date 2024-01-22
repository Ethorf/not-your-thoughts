const express = require('express')
const router = express.Router()
// const bcrypt = require('bcrypt')
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
// const jwtGenerator = require('../utils/jwtGenerator')
// const authorize = require('../middleware/authorize')

// Post /test/user
// Get a user
router.get('/user_test', validInfo, async (req, res) => {
  const userEmail = 'gaycob@gmail.com' // Replace with the actual email you're searching for

  try {
    const user = await pool.query('SELECT * FROM test_users WHERE email = $1', [userEmail])

    if (user.rows.length === 0) {
      return res.status(401).json('Invalid Credential')
    }

    const userRes = user.rows[0]
    return res.json({ userRes })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get /test/user
// Get a user

router.post('/user_test_create', validInfo, async (req, res) => {
  try {
    const user = await pool.query(
      "INSERT INTO test_users (name, email, password) VALUES ('gaycob', 'gaycob@gmail.com', 'kthl8822');"
    )

    if (user.rows.length === 0) {
      return res.status(401).json('Invalid Credential')
    }

    const userRes = user.rows[0]
    return res.json({ userRes })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
