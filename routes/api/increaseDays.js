const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const User = require('../../models/User');

const leapYear = (num) => {
	if (num % 400 === 0) {
		return true;
	} else if (num % 100 === 0) {
		return false;
	} else if (num % 4 === 0) {
		return true;
	} else {
		return false;
	}
};
router.post('/', auth, async (req, res) => {
	const curDate = new Date().toLocaleDateString('en-US');
	const year = parseInt(curDate.split('/')[2], 10);
	try {
		const user = await await User.findById(req.user.id);
		++user.totalDays;

		let CDayNum = parseInt(curDate.split('/')[1], 10);
		let LDCCombo;
		user.lastDayCompleted !== null
			? (LDCCombo = parseInt(user.lastDayCompleted.split('/')[0] + user.lastDayCompleted.split('/')[1], 10))
			: (LDCCombo = 0);

		let CDCombo = parseInt(curDate.split('/')[0] + curDate.split('/')[1], 10);
		if (leapYear(year) === true && LDCCombo === 229 && CDCombo === 301) {
			++user.consecutiveDays;
			console.log('leap year Consec');
		} else if (leapYear(year) === false && LDCCombo === 228 && CDCombo === 301) {
			++user.consecutiveDays;
			console.log('feb Consec');
		} else if (
			CDayNum === 1 &&
			(LDCCombo === 131 ||
				LDCCombo === 331 ||
				LDCCombo === 531 ||
				LDCCombo === 731 ||
				LDCCombo === 831 ||
				LDCCombo === 1031 ||
				LDCCombo === 1231 ||
				LDCCombo === 430 ||
				LDCCombo === 630 ||
				LDCCombo === 930 ||
				LDCCombo === 1130)
		) {
			console.log('its and end of month consec');
			++user.consecutiveDays;
		} else if (CDCombo == LDCCombo + 1) {
			console.log('standard consecuful');
			++user.consecutiveDays;
		} else {
			console.log('those Aint Consecutive at ALL');
		}
		user.lastDayCompleted = curDate;
		await user.save();
		res.json(user.totalDays);
	} catch (err) {
		console.error(err.message);
		res.status(500);
	}
});

module.exports = router;
