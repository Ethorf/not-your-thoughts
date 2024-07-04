const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to create a connection
router.post('/create_connection', authorize, async (req, res) => {
  const { connection_type, primary_entry_id, foreign_entry_id, primary_source, foreign_source, source_type } = req.body

  try {
    // Check if source_type is provided when primary_source is present
    if (primary_source && !source_type) {
      return res.status(400).json({ msg: 'source_type is required when primary_source is present' })
    }

    // Start a transaction
    await pool.query('BEGIN')

    // Check if a connection already exists with the same primary_entry_id and foreign_entry_id
    const existingConnectionQuery = `
      SELECT id FROM connections 
      WHERE (primary_entry_id = $1 AND foreign_entry_id = $2)
         OR (primary_entry_id = $2 AND foreign_entry_id = $1)
    `
    const existingConnection = await pool.query(existingConnectionQuery, [primary_entry_id, foreign_entry_id])

    if (existingConnection.rows.length > 0) {
      // Rollback the transaction
      await pool.query('ROLLBACK')
      console.log('Connection already exists')
      return res.status(400).json({ msg: 'Connection already exists' })
    }

    // Insert the new connection
    const newConnectionQuery = `
      INSERT INTO connections (connection_type, primary_entry_id, foreign_entry_id, primary_source, foreign_source, source_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `
    const newConnection = await pool.query(newConnectionQuery, [
      connection_type,
      primary_entry_id,
      foreign_entry_id,
      primary_source,
      foreign_source,
      source_type,
    ])
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

    // Retrieve all connections for the primary_entry_id including titles of foreign entries
    const connectionsQuery = `
      SELECT connections.*, 
        CASE 
          WHEN connections.primary_entry_id = $1 THEN foreign_entries.title 
          ELSE primary_entries.title 
        END as foreign_entry_title,
        CASE 
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'horizontal' THEN 'sibling'
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'vertical' THEN 'child'
          WHEN connections.foreign_entry_id = $1 AND connections.connection_type = 'vertical' THEN 'parent'
        END as connection_type
      FROM connections
      LEFT JOIN entries as foreign_entries ON connections.foreign_entry_id = foreign_entries.id
      LEFT JOIN entries as primary_entries ON connections.primary_entry_id = primary_entries.id
      WHERE primary_entry_id = $1 OR foreign_entry_id = $1
    `
    const connections = await pool.query(connectionsQuery, [primary_entry_id])

    res.json({ msg: 'Connection created successfully', connectionId: newConnectionId, connections: connections.rows })
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
      SELECT 
        connections.*, 
        CASE 
          WHEN connections.primary_entry_id = $1 THEN foreign_entries.title 
          ELSE primary_entries.title 
        END as foreign_entry_title,
        CASE 
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'horizontal' THEN 'sibling'
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'vertical' THEN 'child'
          WHEN connections.foreign_entry_id = $1 AND connections.connection_type = 'vertical' THEN 'parent'
        END as connection_type
      FROM connections
      LEFT JOIN entries as foreign_entries ON connections.foreign_entry_id = foreign_entries.id
      LEFT JOIN entries as primary_entries ON connections.primary_entry_id = primary_entries.id
      WHERE primary_entry_id = $1 OR foreign_entry_id = $1
    `
    const connections = await pool.query(connectionsQuery, [entry_id])

    // Check if any connections are found
    if (connections.rows.length === 0) {
      return res.status(404).json({ msg: 'No connections found for this entry' })
    }
    console.log('<<<<<< connections.rows >>>>>>>>> is: <<<<<<<<<<<<')
    console.log(connections.rows)
    // Return the connections along with the title from the corresponding foreign_entry_id and updated type
    res.json({ connections: connections.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router

// !! This is my like beginning draft of documentation
// if the connection in question's primary_entry_id is the same as the entry id passed in the params and it's type is 'horizontal' send back the connection with the type prop 'sibling', if the connection in question's primary_entry_id is the same as the entry id passed in the params and it's type is 'vertical' send back the connection with the type prop 'child', and if the connection in question's foreign_entry_id is the same as the entry id passed in the params and it's type is 'vertical' send back the connection with the type prop 'parent',
