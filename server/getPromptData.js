const express = require('express');
const router = express.Router();
const promptData = require('./data/promptsData.json');

router.get('/', (request, response) => {

  response.send(promptData)

})




module.exports = router;