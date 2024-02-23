const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// TODO See if we can abstract some of these functions out and reuse them
// TODO add check for lowercase categories
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

    // Check if category is provided in request
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
      'INSERT INTO entries (user_id, content, type, title, category_id, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, content, type, title, category_id, tag_ids]
    )

    console.log('Node Entry created successfully!')
    return res.json({ newEntry })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /entries/update_node_entry
// Update a node entry

router.post('/update_node_entry', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { entryId, content, category, title, tags } = req.body
  const type = 'node'

  try {
    // Check if entryId, content, and user_id are provided
    if (!entryId || !content || !user_id) {
      return res.status(400).json({ message: 'entryId, content, and user_id are required' })
    }

    // Initialize variables to hold category ID and tag IDs
    let category_id = null
    let tag_ids = []

    // Check if category is provided in request
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

    // Get current content and date from the entry
    let currentEntry = await pool.query('SELECT content, date FROM entries WHERE id = $1', [entryId])
    //  A bunch of weird string modification so that we can split on , only when it's between " " so that normal commas aren't affected
    let currentContent = currentEntry.rows[0].content.split(/",(?=")/).map((str) => str.replace(/[,"{}]/g, '')) || [] // Handle case where current content is null
    let currentDate = currentEntry.rows[0].date || [] // Handle case where current date is null

    // Prepare the new content array with the new content added to the start
    let newContent = [content, ...currentContent]

    // Prepare the new date array with the current date and the current date added to the start
    let newDate = [new Date().toISOString(), ...currentDate]

    // Update entry in the entries table
    let updatedEntry = await pool.query(
      'UPDATE entries SET content = $1, title = COALESCE($2, title), category_id = COALESCE($3, category_id), tags = COALESCE($4, tags), date = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [newContent, title, category_id, tag_ids, newDate, entryId, user_id]
    )

    console.log('Node Entry updated successfully!')
    return res.json({ updatedEntry })
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

// Route to retrieve an entry by id
router.get('/entry/:entryId', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { entryId } = req.params

  try {
    // Retrieve the entry with the provided entryId
    const entry = await pool.query('SELECT * FROM entries WHERE id = $1', [entryId])

    // Check if the entry is found
    if (entry.rows.length === 0) {
      return res.status(404).json({ msg: 'Entry not found' })
    }

    const entryData = entry.rows[0]
    // Check if the user ID associated with the entry matches the user ID of the request
    if (entry.rows[0].user_id !== user_id) {
      return res.status(403).json({ msg: 'Unauthorized access to entry' })
    }

    const jsContentArray = entryData.content
      .substring(1, entryData.content.length - 1)
      .split(',')
      .map((item, index) =>
        index === 0 ? item.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"') : item.replace(/^"(.*)"$/, '$1')
      )

    // If the entry is found and the user ID matches, return it
    res.json({ ...entryData, content: jsContentArray })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
