const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const validInfo = require('../middleware/validInfo')
const authorize = require('../middleware/authorize')

// Get /user_nodes_config/
// Get a user's nodes config

router.get('/', authorize, async (req, res) => {
  const { id } = req.user

  try {
    let nodesConfigQuery = await pool.query('SELECT * FROM user_nodes_config WHERE user_id = $1', [id])
    let nodesConfig = nodesConfigQuery.rows[0]

    console.log('User nodes config retrieved!')
    return res.json({ nodesConfig })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// TODO will have to add indications and validation for the time goal i.e. is it in seconds etc?
router.post('/update_goals', authorize, async (req, res) => {
  const { id: user_id } = req.user

  const {
    node_word_count_goal,
    node_time_goal,
    node_connections_goal,
    daily_nodes_words_goal,
    daily_nodes_time_goal,
    daily_nodes_connections_goal,
  } = req.body

  try {
    // Validate the node_word_count_goal input if provided
    if (node_word_count_goal && !['words', 'time'].includes(journal_goal_preference)) {
      return res.status(400).json({ error: 'Invalid goal preference. Must be "words" or "time".' })
    }

    // Construct the dynamic SQL query
    const query = `
        INSERT INTO user_nodes_config (user_id, node_word_count_goal, node_time_goal, node_connections_goal, daily_nodes_words_goal,daily_nodes_time_goal,daily_nodes_connections_goal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE
        SET 
          node_word_count_goal = COALESCE($2, user_nodes_config.node_word_count_goal),
          node_time_goal = COALESCE($3, user_nodes_config.node_time_goal),
          node_connections_goal = COALESCE($4, user_nodes_config.node_connections_goal)
          daily_nodes_words_goal = COALESCE($5, user_nodes_config.daily_nodes_words_goal)
          daily_nodes_time_goal = COALESCE($6, user_nodes_config.daily_nodes_time_goal)
          daily_nodes_connections_goal = COALESCE($7, user_nodes_config.daily_nodes_connections_goal)

        RETURNING *`

    // Execute the query
    const updatedRow = await pool.query(query, [
      user_id,
      node_word_count_goal,
      node_time_goal,
      node_connections_goal,
      daily_nodes_words_goal,
      daily_nodes_time_goal,
      daily_nodes_connections_goal,
    ])

    console.log('Goals updated successfully!')
    return res.json({ updatedRow: updatedRow.rows[0] })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
