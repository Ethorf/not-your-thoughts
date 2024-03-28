const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const compression = require('compression')
const { fork } = require('child_process')
require('dotenv').config()

const app = express()
const pool = require('./config/neonDb.js')

pool.connect()

app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(express.json({ extended: false }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/test', require('./routes/test'))
app.use('/api/entries', require('./routes/entries'))
app.use('/api/prompts', require('./routes/prompts'))
app.use('/api/journal_config', require('./routes/journal_config'))

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 8082

app.listen(PORT, () => {
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

// OLD ROUTES

// app.use('/api/setFirstLogin', require('./routes/api/setFirstLogin.js'))
// app.use('/api/contact', require('./routes/api/contact.js'))
// app.use('/api/increaseDays', require('./routes/api/increaseDays.js'))
