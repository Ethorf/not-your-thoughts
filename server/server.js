const express = require('express');
const app = express()
const connectDB = require("./config/db")

//The var below imports the schema into our app 
const cors = require('cors')
const getPromptData = require('./getPromptData')
const getResourceData = require('./getResourceData')


app.use(cors());
app.use(express.json({extended:false}))
connectDB();
// Routes
app.use('/api/auth',require('./routes/api/auth'))
// app.use('/api/userProfile', require('./routes/api/userProfile'))
app.use('/api/registerUser',require('./routes/api/registerUser.js'))
app.use('/api/updateUser',require('./routes/api/updateUser.js'))
app.use('/api/increaseDays',require('./routes/api/increaseDays.js'))


app.use('/prompts', getPromptData)
app.use('/resources', getResourceData)



app.listen(8082,()=>{
    console.log("It's an 8082 type of guy for NYT")
})
