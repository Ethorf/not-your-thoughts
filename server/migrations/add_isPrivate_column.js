const pool = require('../config/neonDb')

async function addIsPrivateColumn() {
  try {
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='entries' AND column_name='is_private'
    `)

    if (checkColumn.rows.length > 0) {
      console.log('Column is_private already exists')
      return
    }

    // Add the column with default value false for existing entries
    await pool.query(`
      ALTER TABLE entries 
      ADD COLUMN is_private BOOLEAN DEFAULT false
    `)

    // Update existing journal entries to be private by default
    await pool.query(`
      UPDATE entries 
      SET is_private = true 
      WHERE type = 'journal'
    `)

    console.log('Successfully added is_private column to entries table')
    console.log('Set existing journal entries to private by default')
  } catch (error) {
    console.error('Error adding is_private column:', error.message)
    throw error
  }
}

// Run the migration
addIsPrivateColumn()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(() => {
    // Close the pool connection when migration is done
    pool.end()
  })

