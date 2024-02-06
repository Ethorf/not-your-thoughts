const jwt = require('jsonwebtoken')
require('dotenv').config()

function jwtGenerator(id) {
  const payload = {
    user: {
      id,
    },
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
}

module.exports = jwtGenerator
