module.exports = function (req, res, next) {
  const { email, name, password } = req.body

  function validEmail(userEmail) {
    // Allow letters, numbers, and common special characters in local part (before @)
    // Common characters: +, -, _, ., and word characters
    // Domain part: letters, numbers, dots, hyphens
    return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail)
  }

  if (req.path === '/register') {
    console.log(!email.length)
    if (![email, name, password].every(Boolean)) {
      return res.json('Missing Credentials')
    } else if (!validEmail(email)) {
      return res.json('Invalid Email')
    }
  } else if (req.path === '/login') {
    if (![email, password].every(Boolean)) {
      return res.json('Missing Credentials')
    } else if (!validEmail(email)) {
      return res.json('Invalid Email')
    }
  }

  next()
}
