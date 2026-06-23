const pool = require('../config/neonDb')

async function createShinyTextDismissalsTable() {
  try {
    const checkTable = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'shiny_text_dismissals'
    `)

    if (checkTable.rows.length > 0) {
      console.log('Table shiny_text_dismissals already exists')
      return
    }

    await pool.query(`
      CREATE TABLE shiny_text_dismissals (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        suggested_entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (entry_id, suggested_entry_id)
      )
    `)

    await pool.query(`
      CREATE INDEX idx_shiny_text_dismissals_entry_id
      ON shiny_text_dismissals(entry_id)
    `)

    console.log('Successfully created shiny_text_dismissals table')
  } catch (error) {
    console.error('Error creating shiny_text_dismissals table:', error.message)
    throw error
  }
}

createShinyTextDismissalsTable()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(() => {
    pool.end()
  })
