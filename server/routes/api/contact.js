const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const creds = require('../../config/emailConfig.js');
const express = require('express');
const router = express.Router();

const oauth2Client = new OAuth2(
	'442405174598-9al4vhm9r0s1g0vkl9iem688kdja25ik.apps.googleusercontent.com',
	'3ccW52UcU9gk8HBDZj95GoVc', // Client Secret
	'https://developers.google.com/oauthplayground' // Redirect URL
);
oauth2Client.setCredentials({
	refresh_token:
		'1//04fb2sH-M1w_ZCgYIARAAGAQSNwF-L9IrPYWHARKokOGHa5f0E2_VcbgjP9ncPoqeFQHik8kASTMSbqUEHavmGYR9qmXAz_q1hwM'
});
const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		type: 'OAuth2',
		user: 'ethorf@gmail.com',
		clientId: '442405174598-9al4vhm9r0s1g0vkl9iem688kdja25ik.apps.googleusercontent.com',
		clientSecret: '3ccW52UcU9gk8HBDZj95GoVc',
		refreshToken:
			'1//04fb2sH-M1w_ZCgYIARAAGAQSNwF-L9IrPYWHARKokOGHa5f0E2_VcbgjP9ncPoqeFQHik8kASTMSbqUEHavmGYR9qmXAz_q1hwM',
		accessToken: accessToken
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
