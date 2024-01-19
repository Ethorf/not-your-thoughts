const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const User = require('../../models/User');

router.post('/', auth, async (req, res) => {
	try {
		const user = await await User.findById(req.user.id);
		user.firstLogin = false;
		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});

module.exports = router;
