const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
})
// pool.connect()

pool.on('connect', () => {
  console.log('connected to the NYT neon.tech PGSQL db')
})

// async function getPostgresVersion() {
//   const client = await pool.connect()
//   try {
//     const response = await client.query('SELECT version()')
//     console.log(response.rows[0])
//   } finally {
//     client.release()
//   }
// }

// getPostgresVersion()

module.exports = pool
