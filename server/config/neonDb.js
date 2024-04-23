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

// Establish a database connection
async function connectToDatabase() {
  let client
  try {
    client = await pool.connect()
    console.log('Connected to NYT NeonDB PostgreSQL database')
    // Perform database operations here using the 'client' object
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error.message)
    // Handle connection error gracefully (e.g., retry connection or display error message)
  } finally {
    // Release the client back to the pool when done
    if (client) {
      client.release()
      console.log('Database client released back to the pool')
    }
  }
}

// Call the connectToDatabase function to initiate the connection
connectToDatabase()

module.exports = pool
