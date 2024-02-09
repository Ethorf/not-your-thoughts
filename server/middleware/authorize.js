const jwt = require('jsonwebtoken')
require('dotenv').config()

// it's being used to authenticate our private / protected routes
//and check that there is a token and to verify it
//most middleware uses promises in conjunction with next()

module.exports = async function (req, res, next) {
  try {
    // get token from the header
    const token = req.header('x-auth-token')

    //check if not token
    if (!token) {
      return res.status(401).json({ msg: 'no token, auth slammed down' })
    }

    //Verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    // So this basically passes the user id to the next in the chain which is the /verify route
    req.user = decoded.user
    console.log('Middleware token verified')
    next()
  } catch (err) {
    res.status(401).json({ msg: 'token is not valid' })
  }
}
