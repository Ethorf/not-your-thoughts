const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? true : false,
})

pool.on('connect', () => {
  console.log('connected to the NYT neon.tech PGSQL db')
})

module.exports = pool
