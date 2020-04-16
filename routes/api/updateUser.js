const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

//Adding an Entry
router.post('/', [auth, [check('entry', 'No empty entries allowed!').not().isEmpty()]], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const user = await await User.findById(req.user.id);
		user.entries.push({
			content: req.body.entry,
			date: moment().format(`MMMM Do YYYY, h:mm:ss a`),
			id: uuidv4(),
			numOfWords: req.body.entry.split(' ').filter((item) => item !== '').length
		});
		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Adding a custom user Prompt
router.post('/prompts', [auth, [check('prompt', 'No empty prompts allowed!').not().isEmpty()]], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const user = await await User.findById(req.user.id);
		user.customPrompts.push({
			content: req.body.prompt,
			id: uuidv4(),
			date: moment().format(`MMMM Do YYYY`)
		});
		await user.save();
		res.json(user.customPrompts);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Toggle audio for user
router.post('/toggleAudio', auth, async (req, res) => {
	try {
		const user = await await User.findById(req.user.id);
		user.progressAudioEnabled = !user.progressAudioEnabled;
		await user.save();
		res.json(user.progressAudioEnabled);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
router.post('/toggleCustomPrompts', auth, async (req, res) => {
	try {
		const user = await await User.findById(req.user.id);
		user.customPromptsEnabled = !user.customPromptsEnabled;
		await user.save();
		res.json(user.customPromptsEnabled);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Delete an entry
router.delete('/:id', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const removeIndex = user.entries.map((item) => item.id).indexOf(req.params.id);
		user.entries.splice(removeIndex, 1);
		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});
//Delete a Custom prompt
router.delete('/prompts/:id', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const removeIndex = user.customPrompts.map((item) => item.id).indexOf(req.params.id);
		user.customPrompts.splice(removeIndex, 1);
		await user.save();
		res.json(user.customPrompts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
