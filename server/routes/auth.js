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
  const { email, name, password } = req.body

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length > 0) {
      return res.status(401).json('User already exists!')
    }

    const salt = await bcrypt.genSalt(10)
    const bcryptPassword = await bcrypt.hash(password, salt)
    let newUser = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [
      name,
      email,
      bcryptPassword,
    ])

    console.log(`User with email ${newUser.rows[0].email} created successfully`)
    const jwtToken = jwtGenerator(newUser.rows[0].user_id)
    return res.json({ jwtToken })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /auth/login
// Login a user
router.post('/login', validInfo, async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (user.rows.length === 0) {
      return res.status(401).json('Invalid Credential')
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password)

    if (!validPassword) {
      return res.status(401).json('Invalid Credential')
    }
    const jwtToken = jwtGenerator(user.rows[0].user_id)
    return res.json({ jwtToken })
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
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get /auth/user
// Get a new user

router.get('/user', validInfo, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM user WHERE user_email = gaycob@gmail.com')

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
