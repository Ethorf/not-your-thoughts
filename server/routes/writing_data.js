const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to create writing data
router.post('/create_writing_data', authorize, async (req, res) => {
  const { duration, word_count, entry_id, entry_type } = req.body
  const { id: user_id } = req.user

  try {
    if (duration === undefined || word_count === undefined || entry_id === undefined || entry_type === undefined) {
      return res.status(400).json({ msg: 'Duration, word count, entry ID, and entry type are required' })
    }

    const safeWordCount = Math.max(0, Number(word_count) || 0)
    const safeDuration = Math.max(0, Number(duration) || 0)

    await pool.query('BEGIN')

    // Insert the new writing data into the writing_data table
    const newWritingDataQuery = `
        INSERT INTO entry_writing_data (duration, word_count, entry_id, user_id, entry_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `
    const newWritingData = await pool.query(newWritingDataQuery, [
      safeDuration,
      safeWordCount,
      entry_id,
      user_id,
      entry_type,
    ])
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
  const requestedLocalDate = req.query?.localDate
  const localDate =
    typeof requestedLocalDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(requestedLocalDate)
      ? requestedLocalDate
      : new Date().toISOString().slice(0, 10)
  const requestedTimeZone = req.query?.timeZone
  const timeZone =
    typeof requestedTimeZone === 'string' && requestedTimeZone.length > 0 && requestedTimeZone.length < 100
      ? requestedTimeZone
      : 'UTC'

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

    // Nodes
    let nodesTotalWritingTime = 0
    let nodesWritingTimeToday = 0
    let nodesTotalWordCount = 0
    let nodesWordCountToday = 0

    // Journals
    let journalsTotalWritingTime = 0
    let journalWritingTimeToday = 0
    let journalsTotalWordCount = 0
    let journalWordCountToday = 0

    // Get today's date in UTC (ignoring time) — used for writing-session day buckets
    const today = new Date().toISOString().split('T')[0]

    // Iterate over each writing data entry to calculate totals
    writingData?.forEach((entry) => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0]
      const duration = Math.max(0, Number(entry.duration) || 0)
      const wordCount = Math.max(0, Number(entry.word_count) || 0)

      allEntriesTotalWritingTime += duration
      allEntriesTotalWordCount += wordCount

      if (entryDate === today) {
        allEntriesWritingTimeToday += duration
        allEntriesWordCountToday += wordCount
      }

      if (entry.entry_type === 'node') {
        nodesTotalWritingTime += duration
        nodesTotalWordCount += wordCount

        if (entryDate === today) {
          nodesWritingTimeToday += duration
          nodesWordCountToday += wordCount
        }
      }

      if (entry.entry_type === 'journal') {
        journalsTotalWritingTime += duration
        journalsTotalWordCount += wordCount

        if (entryDate === today) {
          journalWritingTimeToday += duration
        }
      }
    })

    // Journals "words today" = today's journal entry word count (matches the journal editor),
    // not summed typing-session deltas which are often never flushed on navigation.
    try {
      const todaysJournal = await pool.query(
        `SELECT num_of_words
         FROM entries
         WHERE user_id = $1
           AND type = 'journal'
           AND (
             (timezone($2, COALESCE(date_originally_created, NOW())::timestamptz))::date = $3::date
             OR EXISTS (
               SELECT 1
               FROM entry_contents ec
               WHERE ec.entry_id = entries.id
                 AND (timezone($2, ec.date_created::timestamptz))::date = $3::date
             )
           )
         ORDER BY id ASC
         LIMIT 1`,
        [user_id, timeZone, localDate]
      )
      journalWordCountToday = Math.max(0, Number(todaysJournal.rows[0]?.num_of_words) || 0)
    } catch (timezoneQueryError) {
      console.warn(
        'Timezone-aware journal word count lookup failed, falling back to UTC date match:',
        timezoneQueryError.message
      )
      const todaysJournal = await pool.query(
        `SELECT num_of_words
         FROM entries
         WHERE user_id = $1
           AND type = 'journal'
           AND (
             COALESCE(date_originally_created, NOW())::date = $2::date
             OR EXISTS (
               SELECT 1
               FROM entry_contents ec
               WHERE ec.entry_id = entries.id
                 AND ec.date_created::date = $2::date
             )
           )
         ORDER BY id ASC
         LIMIT 1`,
        [user_id, localDate]
      )
      journalWordCountToday = Math.max(0, Number(todaysJournal.rows[0]?.num_of_words) || 0)
    }

    res.status(200).json({
      allEntriesTotalWritingTime,
      allEntriesWritingTimeToday,
      allEntriesTotalWordCount,
      allEntriesWordCountToday,
      nodesTotalWritingTime,
      nodesWritingTimeToday,
      nodesTotalWordCount,
      nodesWordCountToday,
      journalsTotalWritingTime,
      journalWritingTimeToday,
      journalsTotalWordCount,
      journalWordCountToday,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
