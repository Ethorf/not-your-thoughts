const express = require('express');
const app = express()
const cors = require('cors')
const getUserData = require('./getUserData')
const getPromptData = require('./getPromptData')
const getResourceData = require('./getResourceData')

app.use(cors());
app.use(express.json())
app.use('/users', getUserData)
app.use('/prompts', getPromptData)
app.use('/resources', getResourceData)

app.listen(8080,()=>{
    console.log("It's an 8080 type of guy")
})
