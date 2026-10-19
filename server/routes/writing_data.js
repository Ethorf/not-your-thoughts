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
    // Aggregate in SQL instead of shipping every writing session to the client path.
    const todayStart = new Date(`${new Date().toISOString().split('T')[0]}T00:00:00.000Z`)
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const result = await pool.query(
      `SELECT entry_type,
              COALESCE(SUM(GREATEST(duration, 0)), 0) AS total_duration,
              COALESCE(SUM(GREATEST(word_count, 0)), 0) AS total_words,
              COALESCE(SUM(GREATEST(duration, 0)) FILTER (WHERE "date" >= $2 AND "date" < $3), 0) AS today_duration,
              COALESCE(SUM(GREATEST(word_count, 0)) FILTER (WHERE "date" >= $2 AND "date" < $3), 0) AS today_words
       FROM entry_writing_data
       WHERE user_id = $1
       GROUP BY entry_type`,
      [user_id, todayStart.toISOString(), todayEnd.toISOString()]
    )

    let allEntriesTotalWritingTime = 0
    let allEntriesWritingTimeToday = 0
    let allEntriesTotalWordCount = 0
    let allEntriesWordCountToday = 0
    let nodesTotalWritingTime = 0
    let nodesWritingTimeToday = 0
    let nodesTotalWordCount = 0
    let nodesWordCountToday = 0
    let journalsTotalWritingTime = 0
    let journalWritingTimeToday = 0
    let journalsTotalWordCount = 0
    let journalWordCountToday = 0

    result.rows.forEach((row) => {
      const totalDuration = Number(row.total_duration) || 0
      const totalWords = Number(row.total_words) || 0
      const todayDuration = Number(row.today_duration) || 0
      const todayWords = Number(row.today_words) || 0

      allEntriesTotalWritingTime += totalDuration
      allEntriesTotalWordCount += totalWords
      allEntriesWritingTimeToday += todayDuration
      allEntriesWordCountToday += todayWords

      if (row.entry_type === 'node') {
        nodesTotalWritingTime += totalDuration
        nodesTotalWordCount += totalWords
        nodesWritingTimeToday += todayDuration
        nodesWordCountToday += todayWords
      }

      if (row.entry_type === 'journal') {
        journalsTotalWritingTime += totalDuration
        journalsTotalWordCount += totalWords
        journalWritingTimeToday += todayDuration
      }
    })

    // Journals "words today" = today's journal entry word count (matches the journal editor).
    // Compare against a timezone-bounded range so the date column can use an index.
    const journalWordQuery = `SELECT num_of_words
       FROM entries
       WHERE user_id = $1
         AND type = 'journal'
         AND date_originally_created >= ($3::timestamp AT TIME ZONE $2)
         AND date_originally_created < (($3::timestamp + interval '1 day') AT TIME ZONE $2)
       ORDER BY id ASC
       LIMIT 1`
    const journalContentWordQuery = `SELECT e.num_of_words
       FROM entries e
       WHERE e.user_id = $1
         AND e.type = 'journal'
         AND EXISTS (
           SELECT 1
           FROM entry_contents ec
           WHERE ec.entry_id = e.id
             AND ec.date_created >= ($3::timestamp AT TIME ZONE $2)
             AND ec.date_created < (($3::timestamp + interval '1 day') AT TIME ZONE $2)
         )
       ORDER BY e.id ASC
       LIMIT 1`

    try {
      let todaysJournal = await pool.query(journalWordQuery, [user_id, timeZone, localDate])
      if (!todaysJournal.rows.length) {
        todaysJournal = await pool.query(journalContentWordQuery, [user_id, timeZone, localDate])
      }
      journalWordCountToday = Math.max(0, Number(todaysJournal.rows[0]?.num_of_words) || 0)
    } catch (timezoneQueryError) {
      console.warn('Journal word count lookup failed:', timezoneQueryError.message)
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
