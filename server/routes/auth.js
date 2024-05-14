const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
const jwtGenerator = require('../utils/jwtGenerator')
const authorize = require('../middleware/authorize')

// post /auth/register
// Register a new user

router.post('/register', validInfo, async (req, res) => {
  try {
    console.log('in our auth js register')
    const { email, name, password } = req.body
    // Check if user already exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length > 0) {
      console.log('caught same user!')
      return res.status(401).json('User already exists!')
    }
    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const bcryptPassword = await bcrypt.hash(password, salt)

    // Insert new user into database
    let newUser = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [
      name,
      email,
      bcryptPassword,
    ])

    console.log(`User with email ${newUser.rows[0].email} created successfully`)
    const userId = newUser.rows[0].id

    // Create journal config in user_journal_config database
    const newJournalConfig = await pool.query('INSERT INTO user_journal_config (user_id) VALUES ($1) RETURNING *', [
      userId,
    ])
    const newJournalConfigId = newJournalConfig.rows[0].id

    console.log(`User with id ${userId} Journal config created successfully`)

    // Associate new user with journal config
    await pool.query('UPDATE users SET journal_config = $1 WHERE id = $2', [newJournalConfigId, userId])

    // Return JWT token
    const jwtToken = jwtGenerator(userId)
    return res.json({ jwtToken })
  } catch (err) {
    console.log('in our register error catch')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /auth/login
// Login a user
router.post('/login', validInfo, async (req, res) => {
  const { email, password } = req.body

  const lowerCaseEmail = email.toLowerCase()
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [lowerCaseEmail])

    if (user.rows.length === 0) {
      return res.status(401).json('Invalid Credential')
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password)

    if (!validPassword) {
      return res.status(401).json('Invalid Credential')
    }
    const jwtToken = jwtGenerator(user.rows[0].id)

    return res.json({ jwtToken })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

router.post('/reset-password', async (req, res) => {
  const { email, newPassword, resetToken } = req.body

  try {
    // Check if reset token is valid (e.g., check against stored reset token in database)
    const user = await pool.query('SELECT * FROM users WHERE email = $1 AND reset_token = $2', [email, resetToken])

    if (user.rows.length === 0) {
      return res.status(401).json('Invalid or expired reset token')
    }

    // Generate salt and hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update user's password in the database
    await pool.query('UPDATE users SET password = $1, reset_token = NULL WHERE email = $2', [hashedPassword, email])

    return res.status(200).json('Password reset successful')
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get /auth/verify
// Verify jwt token

router.post('/verify', authorize, (req, res) => {
  try {
    res.json(true)
    console.log(req.user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get /auth/user
// Get a new user

router.get('/user', authorize, async (req, res) => {
  try {
    const { id } = req.user

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id])

    if (user.rows.length === 0) {
      return res.status(401).json('No user')
    }

    const userRes = user.rows[0]
    return res.json({ userRes })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
