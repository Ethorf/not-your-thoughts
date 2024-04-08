const { Pool } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

// Specify custom .env file path relative to the root directory
const envPath = path.join(__dirname, '../.env')

// Load environment variables from the specified .env file
dotenv.config({ path: envPath })
console.log('process.env.DATABASE_URL is:')
console.log(process.env.DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? true : false,
})

pool.on('connect', () => {
  console.log('connected to the NYT neon.tech PGSQL db')
})

module.exports = pool
