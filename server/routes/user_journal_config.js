const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
const authorize = require('../middleware/authorize')

// Get /journal_config/
// Get a user's journal config
// ?? Should we use use the authorize jwt middleware here?

router.get('/', authorize, async (req, res) => {
  const { id } = req.user

  try {
    const userJournal = await pool.query('SELECT * FROM user_config WHERE user_id = $1', [id])
    let journalConfig = userJournal.rows[0]

    if (!journalConfig) {
      const createdConfig = await pool.query('INSERT INTO user_config (user_id) VALUES ($1) RETURNING *', [id])
      journalConfig = createdConfig.rows[0]
    }

    console.log('Config retrieved!')
    return res.json({ journalConfig })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// TODO will have to add indications and validation for the time goal i.e. is it in seconds etc?
router.post('/update_goals', authorize, async (req, res) => {
  const { id: user_id } = req.user

  const { journal_goal_preference, daily_time_goal, daily_words_goal } = req.body

  try {
    // Validate the journal_goal_preference input if provided
    if (journal_goal_preference && !['words', 'time'].includes(journal_goal_preference)) {
      return res.status(400).json({ error: 'Invalid goal preference. Must be "words" or "time".' })
    }

    // Construct the dynamic SQL query
    const query = `
        INSERT INTO user_config (user_id, journal_goal_preference, daily_time_goal, daily_words_goal)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE
        SET 
          journal_goal_preference = COALESCE($2, user_config.journal_goal_preference),
          daily_time_goal = COALESCE($3, user_config.daily_time_goal),
          daily_words_goal = COALESCE($4, user_config.daily_words_goal)
        RETURNING *`

    // Execute the query
    const updatedRow = await pool.query(query, [user_id, journal_goal_preference, daily_time_goal, daily_words_goal])

    console.log('Goals updated successfully!')
    return res.json({ updatedRow: updatedRow.rows[0] })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

router.post('/update_day_values', validInfo, async (req, res) => {
  const { user_id } = req.body

  try {
    // Construct the dynamic SQL query
    const query = `
        INSERT INTO user_config (user_id, last_day_completed, consecutive_days_completed, total_days_completed)
        VALUES ($1, CURRENT_DATE, 1, 1)
        ON CONFLICT (user_id) DO UPDATE
        SET 
          last_day_completed = CURRENT_DATE,
          consecutive_days_completed = 1,
          total_days_completed = user_config.total_days_completed + 1
        RETURNING *`

    // consecutive_days_completed = user_config.last_day_completed = CURRENT_DATE ? user_config.consecutive_days_completed + 1 : 1,

    // Execute the query
    const newJournalConfigDayValues = await pool.query(query, [user_id])

    console.log('Journal config day values updated successfully!')
    return res.json({ newJournalConfigDayValues })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// post /journal_config/update
// Update a user's journal config
// ?? Should we use use the authorize jwt middleware here?

router.post('/update_toggles', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { progress_audio_enabled, wpm_display_enabled, timer_enabled, custom_prompts_enabled } = req.body

  try {
    // Convert undefined values to null
    const progressAudioEnabled = progress_audio_enabled !== undefined ? progress_audio_enabled : null
    const wpmEnabled = wpm_display_enabled !== undefined ? wpm_display_enabled : null
    const timerEnabled = timer_enabled !== undefined ? timer_enabled : null
    const customPromptsEnabled = custom_prompts_enabled !== undefined ? custom_prompts_enabled : null

    // Construct the dynamic SQL query
    const query = `
        INSERT INTO user_config (user_id, progress_audio_enabled, wpm_display_enabled, timer_enabled, custom_prompts_enabled)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE
        SET 
          progress_audio_enabled = COALESCE($2, user_config.progress_audio_enabled),
          wpm_display_enabled = COALESCE($3, user_config.wpm_display_enabled),
          timer_enabled = COALESCE($4, user_config.timer_enabled),
          custom_prompts_enabled = COALESCE($5, user_config.custom_prompts_enabled)
        RETURNING *`

    // Execute the query
    const newJournalConfigToggles = await pool.query(query, [
      user_id,
      progressAudioEnabled,
      wpmEnabled,
      timerEnabled,
      customPromptsEnabled,
    ])

    console.log('Journal toggles config updated successfully!')
    return res.json({ newJournalConfigToggles })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
