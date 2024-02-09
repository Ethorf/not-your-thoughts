const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const compression = require('compression')
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
app.use('/api/journal_config', require('./routes/journal_config'))

// app.use('/api/setFirstLogin', require('./routes/api/setFirstLogin.js'))
// app.use('/api/contact', require('./routes/api/contact.js'))
// app.use('/api/increaseDays', require('./routes/api/increaseDays.js'))
// app.use('/prompts', getPromptData)

//Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 8082

app.listen(PORT, () => {
  console.log(`It's an ${PORT} type of collab-test-guy for NYT`)
})
