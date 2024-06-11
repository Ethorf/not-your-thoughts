const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to create a connection
router.post('/create_connection', authorize, async (req, res) => {
  const { type, primary_entry_id, foreign_entry_id, source } = req.body

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Check if a connection already exists with the same primary_entry_id and foreign_entry_id
    const existingConnectionQuery = `
          SELECT id FROM connections 
          WHERE primary_entry_id = $1 AND foreign_entry_id = $2
        `
    const existingConnection = await pool.query(existingConnectionQuery, [primary_entry_id, foreign_entry_id])

    if (existingConnection.rows.length > 0) {
      // Rollback the transaction
      await pool.query('ROLLBACK')
      return res.status(400).json({ msg: 'Connection already exists' })
    }

    // Insert the new connection
    const newConnectionQuery = `
          INSERT INTO connections (type, primary_entry_id, foreign_entry_id, source)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `
    const newConnection = await pool.query(newConnectionQuery, [type, primary_entry_id, foreign_entry_id, source])
    const newConnectionId = newConnection.rows[0].id

    const updateEntriesConnections = async (entryId) => {
      const entry = await pool.query('SELECT connections FROM entries WHERE id = $1', [entryId])
      let currentConnections = entry.rows[0].connections || [] // Initialize to an empty array if null
      currentConnections.push(newConnectionId)
      await pool.query('UPDATE entries SET connections = $1 WHERE id = $2', [currentConnections, entryId])
    }

    // Update connections array for both primary_entry_id and foreign_entry_id
    await updateEntriesConnections(primary_entry_id)
    await updateEntriesConnections(foreign_entry_id)

    // Commit the transaction
    await pool.query('COMMIT')

    res.json({ msg: 'Connection created successfully', connectionId: newConnectionId })
  } catch (err) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to delete a connection by connectionId
router.delete('/delete_connection/:connectionId', authorize, async (req, res) => {
  const { connectionId } = req.params

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Retrieve the connection to be deleted
    const connectionQuery = 'SELECT primary_entry_id, foreign_entry_id FROM connections WHERE id = $1'
    const connectionResult = await pool.query(connectionQuery, [connectionId])

    if (connectionResult.rows.length === 0) {
      // Rollback the transaction
      await pool.query('ROLLBACK')
      return res.status(404).json({ msg: 'Connection not found' })
    }

    const { primary_entry_id, foreign_entry_id } = connectionResult.rows[0]

    // Delete the connection
    const deleteConnectionQuery = 'DELETE FROM connections WHERE id = $1'
    await pool.query(deleteConnectionQuery, [connectionId])

    // Function to update the connections array in the entries table
    const updateEntriesConnections = async (entryId) => {
      const entry = await pool.query('SELECT connections FROM entries WHERE id = $1', [entryId])
      let currentConnections = entry.rows[0].connections || [] // Initialize to an empty array if null

      // Remove the deleted connectionId from the connections array
      currentConnections = currentConnections.filter((id) => id !== connectionId)

      await pool.query('UPDATE entries SET connections = $1 WHERE id = $2', [currentConnections, entryId])
    }

    // Update connections array for both primary_entry_id and foreign_entry_id
    await updateEntriesConnections(primary_entry_id)
    await updateEntriesConnections(foreign_entry_id)

    // Commit the transaction
    await pool.query('COMMIT')

    res.json({ msg: 'Connection deleted successfully' })
  } catch (err) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all connections based on entry_id
router.get('/:entry_id', authorize, async (req, res) => {
  const { entry_id } = req.params

  try {
    // Retrieve all connections where the given entry_id is either primary_entry_id or foreign_entry_id
    const connectionsQuery = `
        SELECT * FROM connections
        WHERE primary_entry_id = $1 OR foreign_entry_id = $1
      `
    const connections = await pool.query(connectionsQuery, [entry_id])

    // Check if any connections are found
    if (connections.rows.length === 0) {
      return res.status(404).json({ msg: 'No connections found for this entry' })
    }

    // Return the connections
    res.json({ connections: connections.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// TODO lower-pri
// Update connection source

module.exports = router
