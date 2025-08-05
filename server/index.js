const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const compression = require('compression')
const { fork } = require('child_process')
const dotenv = require('dotenv')

const envPath = path.join(__dirname, '../.env')

dotenv.config({ path: envPath })

const app = express()
const pool = require('./config/neonDb.js')

// Parse JSON bodies with a larger limit (e.g., 10MB)
app.use(bodyParser.json({ limit: '10mb' }))
app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(express.json({ extended: false }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/akas', require('./routes/akas'))
app.use('/api/connections', require('./routes/connections'))
app.use('/api/entries', require('./routes/entries'))
app.use('/api/health', require('./routes/health'))
app.use('/api/prompts', require('./routes/prompts'))
app.use('/api/user_journal_config', require('./routes/user_journal_config.js'))
app.use('/api/user_nodes_config.js', require('./routes/user_nodes_config.js'))
app.use('/api/writing_data', require('./routes/writing_data.js'))

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set the static assets directory to 'client/build'
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')))

  // All remaining requests return the React app, so it can handle routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 8084

const server = app.listen(PORT, () => {
  console.log(`It's an ${PORT} type of guy for NYT`)

  // Check if backupProcess should run based on process.env.GH_HANDLE
  if (process.env.GH_HANDLE === 'ethorf') {
    // Fork a child process to run the backup script
    console.log('Starting Db backup')
    const backupProcess = fork(path.join(__dirname, 'utils', 'backupDump.js'))

    // Log messages from the backup process
    backupProcess.on('message', (message) => {
      console.log(`Backup process: ${message}`)
    })

    // Handle errors from the backup process
    backupProcess.on('error', (error) => {
      console.error(`Backup process error: ${error}`)
    })
  }
})

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`)

  const retryInterval = 5000 // Retry every 5 seconds
  const maxRetries = 12 // Try for 1 minute

  let attempt = 0

  const tryReconnect = async () => {
    if (attempt < maxRetries) {
      attempt += 1
      try {
        await pool.connect()
        console.log('Reconnected to the database. Resuming operations...')
        return
      } catch (error) {
        console.log(`Retrying to connect to the database... (Attempt ${attempt}/${maxRetries})`)
        setTimeout(tryReconnect, retryInterval)
      }
    } else {
      console.error('Max retries reached. Forcing shutdown...')
      process.exit(1)
    }
  }

  // tryReconnect()
}

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
// process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception', err)
  gracefulShutdown('uncaughtException')
})

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection', err)
  gracefulShutdown('unhandledRejection')
})
