const express = require('express')
const { parse } = require('date-fns')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// post /entries/add_node_entry
// Add a new node entry
router.post('/create_node_entry', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { content, title } = req.body
  const type = 'node'

  try {
    if (!content && !title) {
      return res.status(400).json({ message: 'Either content or title is required' })
    }

    // Check if the title already exists
    if (title) {
      const existingEntry = await pool.query('SELECT id FROM entries WHERE title = $1', [title])
      if (existingEntry.rows.length > 0) {
        return res.status(400).json({ message: 'Title already exists' })
      }
    }

    // Insert entry into entries table
    let newEntry = await pool.query(
      'INSERT INTO entries (user_id, type, title, content_ids) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, type, title, []]
    )

    const entry_id = newEntry.rows[0].id

    // If content is present, insert it into the entry_contents table
    let content_id = null
    if (content) {
      let newContent = await pool.query('INSERT INTO entry_contents (content, entry_id) VALUES ($1, $2) RETURNING id', [
        content,
        entry_id,
      ])
      content_id = newContent.rows[0].id

      // Update the entries table with the content_ids array
      await pool.query('UPDATE entries SET content_ids = $1 WHERE id = $2', [[content_id], entry_id])
    }

    // Set the title to "Untitled" if not provided in the request
    const finalTitle = title || `Untitled #${entry_id}`

    // Update the newly created entry with the final title
    await pool.query('UPDATE entries SET title = $1 WHERE id = $2', [finalTitle, entry_id])

    console.log('Node Entry created successfully!')

    console.log('<<<<<< newEntry >>>>>>>>> is: <<<<<<<<<<<<')
    console.log(newEntry.rows[0].id)
    console.log('<<<<<< title >>>>>>>>> is: <<<<<<<<<<<<')
    console.log(title)
    return res.json({ id: newEntry.rows[0].id, title })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /entries/update_node_entry
// Update a node entry
router.post('/update_node_entry', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { entryId, content, title } = req.body

  try {
    // Check if entryId, content, and user_id are provided
    if (!entryId || !content || !user_id) {
      return res.status(400).json({ message: 'entryId, content, and user_id are required' })
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
      'UPDATE entries SET content_ids = $1, title = COALESCE($2, title) WHERE id = $3 AND user_id = $4 RETURNING *',
      [newContentIds, title, entryId, user_id]
    )

    // Retrieve the most recent content associated with the entry
    let mostRecentContent = await pool.query('SELECT * FROM entry_contents WHERE id = $1', [newContentIds[0]])

    console.log('Node Entry updated successfully!')
    return res.json({ updatedEntry: updatedEntry.rows[0], content: mostRecentContent.rows[0].content })
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
          LIMIT 1) AS date_last_modified
      FROM 
        entries 
      WHERE 
        user_id = $1 
        AND type = $2`,
      [user_id, 'node']
    )

    // Check if there are any entries found
    if (allNodeEntries.rows.length === 0) {
      return res.status(404).json({ msg: 'No node entries found for this user' })
    }

    // Map over entries and add pending status
    const entriesWithPendingStatus = allNodeEntries.rows.map((entry) => {
      return {
        ...entry,
        pending: !entry.content || entry.content.length === 0,
      }
    })

    // If node entries are found, return them with pending status
    res.json({ entries: entriesWithPendingStatus })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all node type entries with title, id, starred, and pending status
router.get('/node_entries_info', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Retrieve node entries' title, id, and starred for the user with the provided user_id
    const nodeEntriesQuery = await pool.query(
      `SELECT 
        entries.id, 
        entries.title, 
        entries.starred,
        ARRAY(
          SELECT content 
          FROM entry_contents 
          WHERE entry_id = entries.id 
          ORDER BY date_created DESC
        ) AS content
      FROM entries 
      WHERE user_id = $1 AND type = 'node'`,
      [user_id]
    )

    const nodeEntries = nodeEntriesQuery.rows

    // Check if there are any entries found
    if (nodeEntries.length === 0) {
      return res.status(404).json({ msg: 'No node entries found for this user' })
    }

    // Process entries to include pending status
    const processedEntries = nodeEntries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      starred: entry.starred,
      pending: !entry.content || entry.content.length === 0,
    }))

    // If node entries are found, return them
    res.json({ nodeEntries: processedEntries })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all entries regardless of type for a user
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
        ARRAY(
          SELECT content 
          FROM entry_contents 
          WHERE entry_id = $1 
          ORDER BY date_created DESC
        ) AS content,
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
      WHERE 
        id = $1 
        AND user_id = $2`,
      [entryId, user_id]
    )

    // Check if the entry is found
    if (entry.rows.length === 0) {
      return res.status(404).json({ msg: 'Entry not found' })
    }

    const entryData = entry.rows[0]
    // If the entry is found and the user ID matches, return it
    res.json(entryData)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to delete an entry by ID
router.delete('/delete_entry/:id', authorize, async (req, res) => {
  const { id } = req.params

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Retrieve connections related to the entry
    const getConnectionsQuery = 'SELECT id FROM connections WHERE primary_entry_id = $1 OR foreign_entry_id = $1'
    const connectionsResult = await pool.query(getConnectionsQuery, [id])
    const connectionIds = connectionsResult.rows.map((row) => row.id)

    if (connectionIds.length > 0) {
      // Retrieve all entries that have any of these connections
      const getEntriesQuery = `
        SELECT id, connections 
        FROM entries 
        WHERE connections && $1::uuid[]
      `
      const entriesResult = await pool.query(getEntriesQuery, [connectionIds])

      // Update the connections array for each related entry
      const updateEntriesConnections = async (entryId, updatedConnections) => {
        await pool.query('UPDATE entries SET connections = $1 WHERE id = $2', [updatedConnections, entryId])
      }

      for (const entry of entriesResult.rows) {
        const updatedConnections = entry.connections.filter((connId) => !connectionIds.includes(connId))
        await updateEntriesConnections(entry.id, updatedConnections)
      }
    }

    // Delete the connections related to the entry
    const deleteConnectionsQuery = 'DELETE FROM connections WHERE primary_entry_id = $1 OR foreign_entry_id = $1'
    await pool.query(deleteConnectionsQuery, [id])

    // Delete the entry
    const deleteEntryQuery = 'DELETE FROM entries WHERE id = $1'
    await pool.query(deleteEntryQuery, [id])

    // Commit the transaction
    await pool.query('COMMIT')

    res.json({ msg: 'Entry and associated connections deleted successfully' })
  } catch (err) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to toggle the starred value of an entry
router.post('/toggle_starred', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { entryId } = req.body

  try {
    // Check if entryId and user_id are provided
    if (!entryId || !user_id) {
      return res.status(400).json({ message: 'entryId and user_id are required' })
    }

    // Retrieve the current starred status of the entry
    const entry = await pool.query('SELECT starred FROM entries WHERE id = $1 AND user_id = $2', [entryId, user_id])

    // Check if the entry exists
    if (entry.rows.length === 0) {
      return res.status(404).json({ message: 'Entry not found' })
    }

    // Toggle the starred status
    const currentStarredStatus = entry.rows[0].starred
    const newStarredStatus = !currentStarredStatus

    // Update the entry's starred status
    await pool.query('UPDATE entries SET starred = $1 WHERE id = $2 AND user_id = $3', [
      newStarredStatus,
      entryId,
      user_id,
    ])

    console.log(`Entry ${entryId} starred status updated successfully!`)
    return res.json({ entryId, starred: newStarredStatus })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// POST /entries/batch_create
// Batch create user journal entriesconst { Pool } = require('pg');

router.post('/batch_create', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { entries } = req.body

  try {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty entries array' })
    }

    const batchSize = 10 // Set your preferred batch size
    const entryChunks = []

    // Split entries into batches of size `batchSize`
    for (let i = 0; i < entries.length; i += batchSize) {
      const chunk = entries.slice(i, i + batchSize)
      entryChunks.push(chunk)
    }

    // Process each entry chunk sequentially
    for (const chunk of entryChunks) {
      await processEntryChunk(chunk, user_id) // Process the current chunk
    }

    console.log('Batch entries created successfully!')
    return res.json({ message: 'Batch entries created successfully' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Function to process a chunk of entries
async function processEntryChunk(chunk, user_id) {
  const type = 'journal' // Assuming these are journal entries

  const insertPromises = chunk.map(async (entry) => {
    const { content, date, numOfWords, wpm, timeElapsed } = entry

    // Preprocess date string to remove ordinal suffix and time information
    const preprocessedDate = preprocessDate(date)

    // Parse preprocessed date string using date-fns parse function
    const parsedDate = parse(preprocessedDate, 'MMMM dd yyyy', new Date())

    if (!parsedDate || isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${date}`)
    }

    // Format parsed date to ISO string for database insertion
    const formattedDate = parsedDate.toISOString()

    // Extract numOfWords, wpm, and timeElapsed values if they exist
    const numWords = parseInt(numOfWords?.['$numberInt'] || 0)
    const wordsPerMinute = parseInt(wpm?.['$numberInt'] || 0)
    const totalTimeTaken = parseInt(timeElapsed?.['$numberInt'] || 0)

    // Insert new entry into entries table
    const newEntry = await pool.query(
      'INSERT INTO entries (user_id, type, num_of_words, wpm, total_time_taken) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user_id, type, numWords, wordsPerMinute, totalTimeTaken]
    )
    const entry_id = newEntry.rows[0].id

    // Insert new entry_contents row
    const newContent = await pool.query(
      'INSERT INTO entry_contents (content, date_created, entry_id) VALUES ($1, $2, $3) RETURNING id',
      [content, formattedDate, entry_id]
    )
    const content_id = newContent.rows[0].id

    // Update content_ids array on the entries table row
    await pool.query('UPDATE entries SET content_ids = array_append(content_ids, $1) WHERE id = $2', [
      content_id,
      entry_id,
    ])
  })

  // Wait for all insert promises to complete
  await Promise.all(insertPromises)
}

// Remove ordinal suffix and time information from date string
function preprocessDate(dateString) {
  // Remove ordinal suffix (e.g., "22nd" -> "22")
  const withoutOrdinal = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1')

  // Remove time information (e.g., "April 14th 2020, 2:09:42 pm" -> "April 14 2020")
  const withoutTime = withoutOrdinal.replace(/,.*$/, '')

  return withoutTime.trim()
}

module.exports = router
