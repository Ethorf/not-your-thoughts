const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send('Server is healthy')
})

router.post('/restart-server', (req, res) => {
  // if (process.env.ALLOW_SERVER_RESTART === 'true') {
  res.send('Server is restarting...')
  process.exit(1) // This will trigger a restart if you're using a process manager like PM2 or nodemon
  // } else {
  //   res.status(403).send('Server restart not allowed')
  // }
})

module.exports = router
