const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	USER: process.env.USER,
	PASS: process.env.PASS
};
