const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

router.post(
	'/',
	[
		auth,
		[
			check('entry', 'No empty entries allowed!')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await await User.findById(req.user.id);
			user.entries.push({
				content: req.body.entry,
				date: moment().format(`MMMM Do YYYY`),
				id: uuidv4(),
				numOfWords: req.body.entry.split(' ').filter((item) => item !== '').length
			});
			await user.save();
			res.json(user);
		} catch (err) {
			console.error(err.message);
			res.status(500);
		}
	}
);

router.delete('/:id', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const removeId = req.params.id;
		// res.json((user.entries.id = removeId)); d
		//Get remove index
		const removeIndex = user.entries.map((item) => item.id).indexOf(req.params.id);

		user.entries.splice(removeIndex, 1);
		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;