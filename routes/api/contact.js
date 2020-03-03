const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const OAuth2 = google.auth.OAuth2;
const express = require('express');
const router = express.Router();

dotenv.config();

const oauth2Client = new OAuth2(
	process.env.CLIENT_ID, //Client Id
	process.env.CLIENT_SECRET, // Client Secret
	'https://developers.google.com/oauthplayground' // Redirect URL
);
oauth2Client.setCredentials({
	refresh_token: process.env.REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		type: 'OAuth2',
		user: 'ethorf@gmail.com',
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		refreshToken: process.env.REFRESH_TOKEN,
		accessToken: accessToken
	},
	tls: {
		rejectUnauthorized: false
	}
});

router.post('/', async (req, res, next) => {
	try {
		const name = req.body.name;
		let email = req.body.email;
		let message = req.body.message;

		let content = `name: ${name} \n email: ${email} \n message: ${message} `;
		let mail = {
			from: name,
			to: 'ethorf@gmail.com', //Change to email address that you want to receive messages on
			subject: 'New Message from Not Your Thoughts Contact Form',
			text: content
		};
		console.log(req.body);
		smtpTransport.sendMail(mail, (err, data) => {
			if (err) {
				res.json({
					msg: 'fail'
				});
			} else {
				console.log(req.body);
				res.json({
					msg: 'success'
				});
			}
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('server error in user');
	}
});

module.exports = router;
