const jwt = require('jsonwebtoken')
const config = require('config')

// it's being used to authenticate our private / protected routes
//and check that there is a token and to verify it
//most middleware uses promises in conjunction with next()

module.exports = function (req, res, next) {
  // get token from the header
  const token = req.header('x-auth-token')

  //check if not token
  if (!token) {
    return res.status(401).json({ msg: 'no token, auth slammed down' })
  }
  //Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded.user
    next()
  } catch (err) {
    res.status(401).json({ msg: 'token is not valid' })
  }
}
