const express = require('express')
const router = express.Router()
// const bcrypt = require('bcrypt')
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
// const jwtGenerator = require('../utils/jwtGenerator')
// const authorize = require('../middleware/authorize')

// Get /auth/user
// Get a new user

router.get('/user', validInfo, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE user_email = gaycob@gmail.com')

    if (user.rows.length === 0) {
      return res.status(401).json('Invalid Credential')
    }

    if (!validPassword) {
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
