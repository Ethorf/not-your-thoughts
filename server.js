const express = require('express');
const app = express();
const compression = require('compression');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const getPromptData = require('./getPromptData');

app.use(cors());
app.use(compression());
app.use(express.json({ extended: false }));
connectDB();
// Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/registerUser', require('./routes/api/registerUser.js'));
app.use('/api/updateUser', require('./routes/api/updateUser.js'));
app.use('/api/setFirstLogin', require('./routes/api/setFirstLogin.js'));
app.use('/api/contact', require('./routes/api/contact.js'));
app.use('/api/increaseDays', require('./routes/api/increaseDays.js'));
app.use('/prompts', getPromptData);

//Serve static assets in production
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
	console.log(`It's an ${PORT} type of guy for NYT`);
});
