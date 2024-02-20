const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// post /entries/add_node_entry
// Add a new node entry

router.post('/create_node_entry', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { content, category, title, tags } = req.body
  const type = 'node'

  try {
    // Check if content is provided
    if (!content) {
      return res.status(400).json({ message: 'Content is required' })
    }

    // Initialize variables to hold category ID and tag IDs
    let category_id = null
    let tag_ids = []

    // Check if category is provided
    if (category) {
      // Check if category already exists
      let existingCategory = await pool.query('SELECT id FROM categories WHERE name = $1', [category])
      if (existingCategory.rows.length === 0) {
        // If category doesn't exist, create a new one
        let newCategory = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category])
        category_id = newCategory.rows[0].id
      } else {
        // If category exists, use its ID
        category_id = existingCategory.rows[0].id
      }
    }

    // Check if tags are provided
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        // Check if tag already exists
        let existingTag = await pool.query('SELECT id FROM tags WHERE name = $1', [tag])
        let tag_id = null
        if (existingTag.rows.length === 0) {
          // If tag doesn't exist, create a new one
          let newTag = await pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tag])
          tag_id = newTag.rows[0].id
        } else {
          // If tag exists, use its ID
          tag_id = existingTag.rows[0].id
        }
        tag_ids.push(tag_id)
      }
    }

    // Insert entry into entries table
    let newEntry = await pool.query(
      'INSERT INTO entries (user_id, content, type, title, category, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, content, type, title, category_id, tag_ids]
    )

    console.log('Node Entry created successfully!')
    return res.json({ newEntry })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /entries/create_journal_entry
// Add a new journal entry

router.post('/create_journal_entry', authorize, async (req, res) => {
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
    const allNodeEntries = await pool.query('SELECT * FROM entries WHERE user_id = $1 AND type = $2', [
      user_id,
      'journal',
    ])

    // Check if there are any entries found
    if (allNodeEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No journal entries found for this user' })
    }

    // If journal entries are found, return them
    res.json({ entries: allNodeEntries.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all journal entries for a user

router.get('/node_entries', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Retrieve all journal entries for the user with the provided user_id
    const allJournalEntries = await pool.query('SELECT * FROM entries WHERE user_id = $1 AND type = $2', [
      user_id,
      'node',
    ])

    // Check if there are any entries found
    if (allJournalEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No node entries found for this user' })
    }

    // If journal entries are found, return them
    res.json({ entries: allJournalEntries.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all entrie regardless of type for a user

router.get('/entries', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Retrieve all journal entries for the user with the provided user_id
    const allEntries = await pool.query('SELECT * FROM entries WHERE user_id = $1', [user_id])

    // Check if there are any entries found
    if (allEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No node entries found for this user' })
    }

    // If journal entries are found, return them
    res.json({ entries: allEntries.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
