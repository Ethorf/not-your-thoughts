const { Pool } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

// Specify custom .env file path relative to the root directory
const envPath = path.join(__dirname, '../.env')

// Load environment variables from the specified .env file
dotenv.config({ path: envPath })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Adjust SSL options based on your environment
})

// Handle pool connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1) // Exit the Node.js process on critical error
})

// Establish a database connection with retry logic
const connectWithRetry = async () => {
  const retryInterval = 5000 // Retry every 5 seconds
  const maxRetries = 12 // Try for 1 minute

  let attempt = 0

  while (attempt < maxRetries) {
    attempt += 1
    try {
      await pool.connect()
      console.log('Connected to NYT NeonDB PostgreSQL database')
      return
    } catch (error) {
      console.error(`Error connecting to PostgreSQL (Attempt ${attempt}/${maxRetries}):`, error.message)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryInterval))
      } else {
        throw error
      }
    }
  }
}

// Call the connectWithRetry function to initiate the connection
connectWithRetry().catch((error) => {
  console.error('Failed to connect to the database after maximum retries. Exiting...')
  process.exit(-1)
})

module.exports = pool
