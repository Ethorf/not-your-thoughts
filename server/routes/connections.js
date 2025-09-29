const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to create a connection
router.post('/create_connection', authorize, async (req, res) => {
  const {
    connection_type,
    primary_entry_id,
    foreign_entry_id,
    primary_source,
    foreign_source,
    source_type,
    current_entry_id,
  } = req.body

  try {
    if (primary_source && !source_type) {
      return res.status(400).json({ msg: 'source_type is required when primary_source is present' })
    }

    await pool.query('BEGIN')

    // Check for existing connection
    const existingConnectionQuery = `
      SELECT id FROM connections 
      WHERE (primary_entry_id = $1 AND foreign_entry_id = $2)
         OR (primary_entry_id = $2 AND foreign_entry_id = $1)
    `
    const existingConnection = await pool.query(existingConnectionQuery, [primary_entry_id, foreign_entry_id])
    if (existingConnection.rows.length > 0) {
      await pool.query('ROLLBACK')
      return res.status(400).json({ msg: 'Connection already exists' })
    }

    // Check if trying to create parent connection for top-level node
    if (connection_type === 'parent') {
      const topLevelCheckQuery = `
        SELECT is_top_level FROM entries 
        WHERE id = $1 AND user_id = $2
      `
      const topLevelCheck = await pool.query(topLevelCheckQuery, [foreign_entry_id, req.user.id])

      if (topLevelCheck.rows.length > 0 && topLevelCheck.rows[0].is_top_level) {
        await pool.query('ROLLBACK')
        return res.status(400).json({
          msg: 'Cannot create parent connections for top-level nodes',
        })
      }
    }

    // Insert new connection
    const newConnectionQuery = `
      INSERT INTO connections 
        (connection_type, primary_entry_id, foreign_entry_id, primary_source, foreign_source, source_type)
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

    // Helper to append to entries.connections array
    const updateEntriesConnections = async (entryId) => {
      const entry = await pool.query('SELECT connections FROM entries WHERE id = $1', [entryId])
      const currentConnections = entry.rows[0].connections || []
      currentConnections.push(newConnectionId)
      await pool.query('UPDATE entries SET connections = $1 WHERE id = $2', [currentConnections, entryId])
    }

    await updateEntriesConnections(primary_entry_id)
    if (foreign_entry_id) {
      await updateEntriesConnections(foreign_entry_id)
    }

    await pool.query('COMMIT')

    // Return updated list of connections for the current entry
    const connectionsQuery = `
      SELECT 
        connections.*,
        foreign_entries.title  AS foreign_entry_title,
        primary_entries.title  AS primary_entry_title,
        CASE 
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'horizontal' THEN 'sibling'
          WHEN connections.foreign_entry_id = $1  AND connections.connection_type = 'horizontal' THEN 'sibling'
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'vertical'   THEN 'child'
          WHEN connections.foreign_entry_id = $1  AND connections.connection_type = 'vertical'   THEN 'parent'
        END AS connection_type
      FROM connections
      LEFT JOIN entries AS foreign_entries  ON connections.foreign_entry_id  = foreign_entries.id
      LEFT JOIN entries AS primary_entries  ON connections.primary_entry_id  = primary_entries.id
      WHERE connections.primary_entry_id = $1 OR connections.foreign_entry_id = $1
    `
    const connections = await pool.query(connectionsQuery, [current_entry_id])

    res.json({
      msg: 'Connection created successfully',
      connectionId: newConnectionId,
      connections: connections.rows,
    })
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to delete a connection by connectionId
router.delete('/delete_connection/:connectionId', authorize, async (req, res) => {
  const { connectionId } = req.params

  try {
    await pool.query('BEGIN')

    // Retrieve the connection
    const connectionQuery = 'SELECT primary_entry_id, foreign_entry_id FROM connections WHERE id = $1'
    const connectionResult = await pool.query(connectionQuery, [connectionId])
    if (connectionResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ msg: 'Connection not found' })
    }
    const { primary_entry_id, foreign_entry_id } = connectionResult.rows[0]

    // Delete the connection row
    await pool.query('DELETE FROM connections WHERE id = $1', [connectionId])

    // Helper to remove from entries.connections array
    const updateEntriesConnections = async (entryId) => {
      const entry = await pool.query('SELECT connections FROM entries WHERE id = $1', [entryId])
      let currentConnections = entry.rows[0].connections || []
      currentConnections = currentConnections.filter((id) => id !== connectionId)
      await pool.query('UPDATE entries SET connections = $1 WHERE id = $2', [currentConnections, entryId])
    }

    await updateEntriesConnections(primary_entry_id)
    if (foreign_entry_id !== null) {
      await updateEntriesConnections(foreign_entry_id)
    }

    await pool.query('COMMIT')
    res.json({ msg: 'Connection deleted successfully' })
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to update an existing connection
router.put('/update_connection/:connectionId', authorize, async (req, res) => {
  const { connectionId } = req.params
  const { connection_type, primary_entry_id, foreign_entry_id, primary_source, foreign_source, source_type } = req.body

  try {
    await pool.query('BEGIN')

    // Ensure the connection exists
    const connectionResult = await pool.query('SELECT * FROM connections WHERE id = $1', [connectionId])
    if (connectionResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ msg: 'Connection not found' })
    }

    // Build dynamic SET clause
    const fieldsToUpdate = []
    const values = []
    let i = 1

    if (connection_type !== undefined) {
      fieldsToUpdate.push(`connection_type = $${i++}`)
      values.push(connection_type)
    }
    if (primary_entry_id !== undefined) {
      fieldsToUpdate.push(`primary_entry_id = $${i++}`)
      values.push(primary_entry_id)
    }
    if (foreign_entry_id !== undefined) {
      fieldsToUpdate.push(`foreign_entry_id = $${i++}`)
      values.push(foreign_entry_id)
    }
    if (primary_source !== undefined) {
      fieldsToUpdate.push(`primary_source = $${i++}`)
      values.push(primary_source)
    }
    if (foreign_source !== undefined) {
      fieldsToUpdate.push(`foreign_source = $${i++}`)
      values.push(foreign_source)
    }
    if (source_type !== undefined) {
      fieldsToUpdate.push(`source_type = $${i++}`)
      values.push(source_type)
    }

    if (!fieldsToUpdate.length) {
      await pool.query('ROLLBACK')
      return res.status(400).json({ msg: 'No valid fields provided for update' })
    }

    values.push(connectionId)
    const updateQuery = `
      UPDATE connections
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `
    const updatedConnection = await pool.query(updateQuery, values)

    await pool.query('COMMIT')
    res.json({
      msg: 'Connection updated successfully',
      connection: updatedConnection.rows[0],
    })
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve all connections for an entry
router.get('/:entry_id', authorize, async (req, res) => {
  const { entry_id } = req.params

  try {
    const connectionsQuery = `
      SELECT 
        connections.*,
        foreign_entries.title  AS foreign_entry_title,
        primary_entries.title  AS primary_entry_title,
        CASE 
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'horizontal' THEN 'sibling'
          WHEN connections.foreign_entry_id = $1  AND connections.connection_type = 'horizontal' THEN 'sibling'
          WHEN connections.primary_entry_id = $1 AND connections.connection_type = 'vertical'   THEN 'child'
          WHEN connections.foreign_entry_id = $1  AND connections.connection_type = 'vertical'   THEN 'parent'
        END AS connection_type
      FROM connections
      LEFT JOIN entries AS foreign_entries  ON connections.foreign_entry_id  = foreign_entries.id
      LEFT JOIN entries AS primary_entries  ON connections.primary_entry_id  = primary_entries.id
      WHERE connections.primary_entry_id = $1 OR connections.foreign_entry_id = $1
    `
    const connections = await pool.query(connectionsQuery, [entry_id])

    if (!connections.rows.length) {
      return res.status(204).json({ msg: 'No connections found for this entry' })
    }

    res.json({ connections: connections.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router

// !! This is my like beginning draft of documentation
// TODO should we change to master / slave here???

// note -- BELOW IS CREATION ONLY RIGHT NOW

// ** HORIZONTAL / SIBLING CONNECTIONS
//  if the connection's primary_entry_id is the same as the current_entry_id passed in the params
//  send back the connection with the type prop 'sibling',

// ** VERTICAL / CHILD & PARENT CONNECTIONS
//  if the connection's primary_entry_id is the same as the current_entry_id passed in the params
//  and the foreign_entry_id is of the node (non-current) that is being connected to
//  send back the connection with the type prop 'child',

//  if the connection's foreign_entry_id is the same as the current_entry_id passed in the params
//  and the primary_entry_id is of the node (non-current) that is being connected to
//  send back the connection with the type prop 'parent',

// ** Basically for Vertical connections, Parents must always have the primary_entry_id & children must have foreign_entry_id
