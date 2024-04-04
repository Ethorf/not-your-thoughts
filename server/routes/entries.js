const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

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
      'INSERT INTO entries (user_id, type, title, category_id, tags, content_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, type, title, category_id || null, tag_ids.length > 0 ? tag_ids : null, []]
    )

    const entry_id = newEntry.rows[0].id

    // Insert entry content into entry_contents table
    let newContent = await pool.query('INSERT INTO entry_contents (content, entry_id) VALUES ($1, $2) RETURNING id', [
      content,
      entry_id,
    ])
    const content_id = newContent.rows[0].id

    // Update the entries table with the content_ids array
    await pool.query('UPDATE entries SET content_ids = $1 WHERE id = $2', [[content_id], entry_id])

    // Set the title to "Untitled" if not provided in the request
    const finalTitle = title || `Untitled #${entry_id}`

    // Update the newly created entry with the final title
    await pool.query('UPDATE entries SET title = $1 WHERE id = $2', [finalTitle, entry_id])

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

    // Get current content_ids from the entry
    let currentEntry = await pool.query('SELECT content_ids FROM entries WHERE id = $1', [entryId])
    let currentContentIds = currentEntry.rows[0].content_ids || [] // Handle case where current content_ids is null

    // Initialize newContentIds array with current content IDs
    let newContentIds = [...currentContentIds]

    // Check if content has changed
    if (content !== currentContentIds[0]) {
      // Insert new content into entry_contents table
      let newContentInsert = await pool.query(
        'INSERT INTO entry_contents (content, entry_id) VALUES ($1, $2) RETURNING id',
        [content, entryId]
      )
      let newContentId = newContentInsert.rows[0].id

      // Add new content ID to the beginning of content IDs array
      newContentIds.unshift(newContentId)
    }

    // Update entry in the entries table
    let updatedEntry = await pool.query(
      'UPDATE entries SET content_ids = $1, title = COALESCE($2, title), category_id = COALESCE($3, category_id), tags = COALESCE($4, tags) WHERE id = $5 AND user_id = $6 RETURNING *',
      [newContentIds, title, category_id, tag_ids, entryId, user_id]
    )

    // Fetch the category name
    let categoryData = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id])
    let category_name = categoryData.rows[0] ? categoryData.rows[0].name : null

    console.log('Node Entry updated successfully!')
    return res.json({ updatedEntry: updatedEntry.rows[0], category_name })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /entries/save_journal_entry
// Create / save a  journal entry

router.post('/save_journal_entry', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { content, total_time_taken = 0, wpm = 0, num_of_words = 0, entryId } = req.body
  const type = 'journal'

  try {
    // Check if content is provided
    if (!content) {
      return res.status(400).json({ message: 'Content is required' })
    }

    let content_id
    let entry_id

    // If entryId is provided, update existing entry
    if (entryId) {
      entry_id = entryId
      await pool.query('UPDATE entries SET total_time_taken = $1, wpm = $2, num_of_words = $3 WHERE id = $4', [
        total_time_taken,
        wpm,
        num_of_words,
        entryId,
      ])
    } else {
      // Insert new entry into entries table
      const newEntry = await pool.query(
        'INSERT INTO entries (user_id, type, total_time_taken, wpm, num_of_words, content_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user_id, type, total_time_taken, wpm, num_of_words, []]
      )
      entry_id = newEntry.rows[0].id
    }

    // Insert or update entry_contents row
    if (entryId) {
      // If entryId is provided, update existing entry_contents
      await pool.query('UPDATE entry_contents SET content = $1 WHERE entry_id = $2', [content, entryId])
      content_id = entryId
    } else {
      // Insert new entry_contents row
      const newContent = await pool.query(
        'INSERT INTO entry_contents (content, entry_id) VALUES ($1, $2) RETURNING id',
        [content, entry_id]
      )
      content_id = newContent.rows[0].id

      // Update the content_ids array on the entries table row
      await pool.query('UPDATE entries SET content_ids = array_append(content_ids, $1) WHERE id = $2', [
        content_id,
        entry_id,
      ])
    }

    console.log('Journal Entry created successfully!')
    return res.json({ entry_id })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all journal entries for a user
router.get('/journal_entries', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    console.log('JOUNRAL TRY HIT')
    const allJournalEntries = await pool.query(
      `SELECT 
        entries.*, 
        ARRAY(
          SELECT content 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created DESC
        ) AS content,
        (SELECT date_created 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created ASC 
          LIMIT 1) AS date_created,
        (SELECT date_created 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created DESC 
          LIMIT 1) AS date_last_modified
      FROM 
        entries 
      WHERE 
        user_id = $1 
        AND type = $2`,
      [user_id, 'journal']
    )

    // Check if there are any entries found
    if (allJournalEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No journal entries found for this user' })
    }

    // If journal entries are found, return them

    res.json({ entries: allJournalEntries.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all journal entries for a user
router.get('/node_entries', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Retrieve all node entries for the user with the provided user_id
    const allNodeEntries = await pool.query(
      `SELECT 
        entries.*, 
        ARRAY(
          SELECT content 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created DESC
        ) AS content,
        (SELECT date_created 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created ASC 
          LIMIT 1) AS date_created,
        (SELECT date_created 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created DESC 
          LIMIT 1) AS date_last_modified,
        categories.name AS category_name
      FROM 
        entries 
      LEFT JOIN 
        categories ON entries.category_id = categories.id 
      WHERE 
        user_id = $1 
        AND type = $2`,
      [user_id, 'node']
    )

    // Check if there are any entries found
    if (allNodeEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No node entries found for this user' })
    }

    // If node entries are found, return them
    res.json({ entries: allNodeEntries.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all entrie regardless of type for a user
router.get('/all_entries', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Retrieve all journal entries for the user with the provided user_id
    const allEntries = await pool.query(
      `SELECT entries.*, 
      ARRAY(SELECT content FROM entry_contents WHERE entry_id = entries.id) AS content,
      ARRAY(SELECT name FROM tags WHERE id = ANY(entries.tags)) AS tag_names
       FROM entries 
       WHERE user_id = $1`,
      [user_id]
    )

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

// Route to get entry by entryId query param
router.get('/entry/:entryId', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { entryId } = req.params

  try {
    // Retrieve the entry with the provided entryId
    const entry = await pool.query(
      `SELECT 
        entries.*, 
        categories.name AS category_name, 
        ARRAY(
          SELECT content 
          FROM entry_contents 
          WHERE entry_id = $1 
          ORDER BY date_created DESC
        ) AS content,
        ARRAY(
          SELECT name 
          FROM tags 
          WHERE id = ANY(entries.tags)
        ) AS tag_names,
        (SELECT date_created 
          FROM entry_contents 
          WHERE entry_id = $1 
          ORDER BY date_created ASC 
          LIMIT 1) AS date_created,
        (SELECT date_created 
          FROM entry_contents 
          WHERE entry_id = $1 
          ORDER BY date_created DESC 
          LIMIT 1) AS date_last_updated
      FROM 
        entries 
      LEFT JOIN 
        categories ON entries.category_id = categories.id
      WHERE 
        entries.id = $1`,
      [entryId]
    )

    // Check if the entry is found
    if (entry.rows.length === 0) {
      return res.status(404).json({ msg: 'Entry not found' })
    }

    const entryData = entry.rows[0]
    // Check if the user ID associated with the entry matches the user ID of the request
    if (entryData.user_id !== user_id) {
      return res.status(403).json({ msg: 'Unauthorized access to entry' })
    }

    // If the entry is found and the user ID matches, return it
    res.json(entryData)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all categories
router.get('/categories', authorize, async (req, res) => {
  try {
    // Retrieve all categories
    const allCategories = await pool.query('SELECT * FROM categories')

    // Check if there are any categories found
    if (allCategories.rows.length === 0) {
      return res.status(404).json({ msg: 'No categories found' })
    }

    // If categories are found, return them
    res.json({ categories: allCategories.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all tags
router.get('/tags', authorize, async (req, res) => {
  try {
    // Retrieve all categories
    const allTags = await pool.query('SELECT * FROM tags')

    // Check if there are any categories found
    if (allTags.rows.length === 0) {
      return res.status(404).json({ msg: 'No tags found' })
    }

    // If categories are found, return them
    res.json({ tags: allTags.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
