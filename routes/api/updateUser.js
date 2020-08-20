const express = require('express');
const router = express.Router();
const pd = require('paralleldots');
pd.apiKey = process.env.PD_API_KEY;
const auth = require('../../middleware/auth.js');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

// set a new words goal
router.post(
	'/setNewWordsGoal',
	[auth, [check('goal', 'Must have some new goal in there!').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const user = await await User.findById(req.user.id);
			user.dailyWordsGoal = req.body.goal;
			await user.save();
			res.json(user);
		} catch (err) {
			console.error(err.message);
			res.status(500);
		}
	}
);
router.post(
	'/setNewTimeGoal',
	[auth, [check('goal', 'Must have some new goal in there!').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const user = await await User.findById(req.user.id);
			user.dailyTimeGoal = req.body.goal;
			await user.save();
			res.json(user);
		} catch (err) {
			console.error(err.message);
			res.status(500);
		}
	}
);
//Adding an Entry
router.post('/', [auth, [check('entry', 'No empty entries allowed!').not().isEmpty()]], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const user = await User.findById(req.user.id);
		user.entries.push({
			content: req.body.entry,
			date: req.body.date,
			timeElapsed: req.body.timeElapsed,
			wpm: req.body.wpm,
			id: uuidv4(),
			numOfWords: req.body.entry.split(' ').filter((item) => item !== '').length,
			pdEmotionAnalysis: null
		});
		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Adding analysis to an Entry
router.post('/entryAnalysis/:id', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const entryIndex = await user.entries.map((item) => item.id).indexOf(req.params.id);
		const textToAnalyze = user.entries[entryIndex].content;

		let textAnalysis = {};
		if (user.entries[entryIndex].pdEmotionAnalysis === null) {
			await pd
				.emotion(textToAnalyze, 'en')
				.then((response) => {
					textAnalysis = response;
				})
				.catch((error) => {
					console.log(error);
				});
			user.entries[entryIndex].pdEmotionAnalysis = JSON.parse(textAnalysis);
			await user.markModified('entries');
			await user.save();
			res.json(user.entries[entryIndex]);
		} else {
			res.send('Analysis already exists for this entry, preventing unnecessary API call');
		}
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
//Adding a custom user Prompt
router.post('/prompts', [auth, [check('prompt', 'No empty prompts allowed!').not().isEmpty()]], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const user = await User.findById(req.user.id);
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
//Adding a custom user tracked phrase
router.post('/phrases', [auth, [check('phrase', 'No empty phrases allowed!').not().isEmpty()]], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const user = await User.findById(req.user.id);
		user.trackedPhrases.push({
			phrase: req.body.phrase,
			id: uuidv4(),
			date: moment().format(`MMMM Do YYYY`)
		});
		await user.save();
		res.json(user.trackedPhrases);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Delete a tracked Phrase
router.delete('/phrases/:id', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const removeIndex = user.trackedPhrases.map((item) => item.id).indexOf(req.params.id);
		user.trackedPhrases.splice(removeIndex, 1);
		await user.save();
		res.json(user.trackedPhrases);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});
//Toggle Custom Prompts
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
//Toggle Timer
router.post('/toggleTimer', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		user.timerEnabled = !user.timerEnabled;
		await user.save();
		res.json(user.timerEnabled);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Toggle Goal Preference
router.post('/toggleGoal', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (user.goalPreference === 'words') {
			user.goalPreference = 'time';
		} else {
			user.goalPreference = 'words';
		}
		await user.save();
		res.json(user.goalPreference);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});
//Toggle Wpm
router.post('/toggleWpm', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		user.wpmEnabled = !user.wpmEnabled;
		await user.save();
		res.json(user.wpmEnabled);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});

module.exports = router;
