const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to create a new custom prompt
router.post('/create_custom_prompt', authorize, async (req, res) => {
  const { content } = req.body
  const { id: user_id } = req.user

  try {
    const newCustomPrompt = await pool.query(
      'INSERT INTO custom_prompts (content, user_id, date) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [content, user_id]
    )

    res.json(newCustomPrompt.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// Route to get all custom prompts based on user ID
router.get('/custom_prompts', authorize, async (req, res) => {
  const { id: user_id } = req.user

  try {
    const customPrompts = await pool.query('SELECT * FROM custom_prompts WHERE user_id = $1', [user_id])

    res.json(customPrompts.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// Route to delete a custom prompt by ID
router.delete('/delete_custom_prompt/:promptId', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { promptId } = req.params

  try {
    // Check if the prompt belongs to the user
    const prompt = await pool.query('SELECT * FROM custom_prompts WHERE id = $1 AND user_id = $2', [promptId, user_id])

    if (prompt.rows.length === 0) {
      return res.status(404).json({ msg: 'Custom prompt not found for this user' })
    }

    // Delete the custom prompt
    await pool.query('DELETE FROM custom_prompts WHERE id = $1', [promptId])

    res.json({ msg: 'Custom prompt deleted successfully' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// Route to toggle a custom prompt's starred value by ID
router.put('/toggle_prompt_starred/:promptId', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { promptId } = req.params

  try {
    // Retrieve the custom prompt by ID
    const prompt = await pool.query('SELECT * FROM custom_prompts WHERE id = $1 AND user_id = $2', [promptId, user_id])

    if (prompt.rows.length === 0) {
      return res.status(404).json({ msg: 'Custom prompt not found for this user' })
    }

    const currentStarredValue = prompt.rows[0].starred
    const newStarredValue = !currentStarredValue // Toggle the starred value

    // Update the custom prompt's starred value
    await pool.query('UPDATE custom_prompts SET starred = $1 WHERE id = $2', [newStarredValue, promptId])

    res.json({ msg: 'Custom prompt starred value toggled successfully' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// Route to update a custom prompt's status by ID
router.put('/update_prompt_status/:promptId', authorize, async (req, res) => {
  const { id: user_id } = req.user
  const { promptId } = req.params
  const { status } = req.body

  try {
    // Retrieve the custom prompt by ID
    const prompt = await pool.query('SELECT * FROM custom_prompts WHERE id = $1 AND user_id = $2', [promptId, user_id])

    if (prompt.rows.length === 0) {
      return res.status(404).json({ msg: 'Custom prompt not found for this user' })
    }

    // Update the custom prompt's status
    await pool.query('UPDATE custom_prompts SET status = $1 WHERE id = $2', [status, promptId])

    res.json({ msg: 'Custom prompt status updated successfully' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
