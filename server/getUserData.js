const express = require('express');
const router = express.Router();
const userData = require('./data/userData.json');

router.get('/', (request, response) => {

  response.send(userData)

})




module.exports = router;