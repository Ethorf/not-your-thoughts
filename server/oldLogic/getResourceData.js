const express = require('express');
const router = express.Router();
const resourceData = require('./data/resourcesData.json');

router.get('/resources', (request, response) => {

  response.send(resourceData)

})




module.exports = router;