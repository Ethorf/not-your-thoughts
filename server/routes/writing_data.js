const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to create writing data
router.post('/create_writing_data', authorize, async (req, res) => {
  const { duration, word_count, entry_id, entry_type } = req.body
  const { id: user_id } = req.user
  console.log('created writing data hit backend')
  try {
    // Validate inputs
    if (duration === undefined || word_count === undefined || entry_id === undefined || entry_type === undefined) {
      return res.status(400).json({ msg: 'Duration, word count, entry ID, and entry type are required' })
    }

    await pool.query('BEGIN')

    // Insert the new writing data into the writing_data table
    const newWritingDataQuery = `
        INSERT INTO entry_writing_data (duration, word_count, entry_id, user_id, entry_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `
    const newWritingData = await pool.query(newWritingDataQuery, [duration, word_count, entry_id, user_id, entry_type])
    const newWritingDataId = newWritingData.rows[0].id

    // Retrieve the current writing_data array for the given entry_id
    const entryQuery = `
        SELECT writing_data FROM entries WHERE id = $1
      `
    const entryResult = await pool.query(entryQuery, [entry_id])

    if (entryResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ msg: 'Entry not found' })
    }

    let currentWritingData = entryResult.rows[0].writing_data || []

    // Add the new writing data ID to the writing_data array
    currentWritingData.push(newWritingDataId)

    // Update the entry's writing_data array in the entries table
    const updateEntryQuery = `
        UPDATE entries SET writing_data = $1 WHERE id = $2
      `
    await pool.query(updateEntryQuery, [currentWritingData, entry_id])

    await pool.query('COMMIT')

    res.status(201).json({ msg: 'Writing data created and associated successfully', writingDataId: newWritingDataId })
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to get total writing time and word count data for a user
router.get('/all_writing_data', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    // Query to get all the writing data for the user
    const userWritingDataQuery = `
      SELECT duration, word_count, "date", entry_type 
      FROM entry_writing_data
      WHERE user_id = $1
    `

    const result = await pool.query(userWritingDataQuery, [user_id])

    const writingData = result.rows

    // Initialize the totals
    let allEntriesTotalWritingTime = 0
    let allEntriesWritingTimeToday = 0
    let allEntriesTotalWordCount = 0
    let allEntriesWordCountToday = 0
    let totalNodesWritingTime = 0
    let nodesWritingTimeToday = 0
    let totalNodeEntriesWordCount = 0
    let nodeEntriesWordCountToday = 0
    let totalJournalEntriesWritingTime = 0
    let journalEntriesWritingTimeToday = 0

    // Get today's date in UTC (ignoring time)
    const today = new Date().toISOString().split('T')[0]

    // Iterate over each writing data entry to calculate totals
    writingData.forEach((entry) => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0]

      allEntriesTotalWritingTime += entry.duration
      allEntriesTotalWordCount += entry.word_count

      if (entryDate === today) {
        allEntriesWritingTimeToday += entry.duration
        allEntriesWordCountToday += entry.word_count
      }

      if (entry.entry_type === 'node') {
        totalNodesWritingTime += entry.duration
        totalNodeEntriesWordCount += entry.word_count

        if (entryDate === today) {
          nodesWritingTimeToday += entry.duration
          nodeEntriesWordCountToday += entry.word_count
        }
      }

      if (entry.entry_type === 'journal') {
        totalJournalEntriesWritingTime += entry.duration

        if (entryDate === today) {
          journalEntriesWritingTimeToday += entry.duration
        }
      }
    })

    res.status(200).json({
      allEntriesTotalWritingTime,
      allEntriesWritingTimeToday,
      allEntriesTotalWordCount,
      allEntriesWordCountToday,
      totalNodesWritingTime,
      nodesWritingTimeToday,
      totalNodeEntriesWordCount,
      nodeEntriesWordCountToday,
      totalJournalEntriesWritingTime,
      journalEntriesWritingTimeToday,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
