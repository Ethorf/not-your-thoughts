const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const compression = require('compression')

const app = express()
const pool = require('./config/neonDb.js')

pool.connect()

app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(express.json({ extended: false }))

// Routes

// const getPromptData = require('./getPromptData')
// app.use('/api/auth/', require('./routes/api/auth'))
// app.use('/api/registerUser', require('./routes/api/registerUser.js'))
// app.use('/api/updateUser', require('./routes/api/updateUser.js'))
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
  console.log(`It's an ${PORT} type of guy for NYT`)
})
