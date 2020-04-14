const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	consecutiveDays: {
		type: Number,
		default: 0
	},
	totalDays: {
		type: Number,
		default: 0
	},
	entries: {
		type: Array
	},
	lastDayCompleted: {
		type: String,
		default: null
	},
	firstLogin: {
		type: Boolean,
		default: true
	},
	progressAudioEnabled: {
		type: Boolean,
		default: true
	},
	dailyWordsGoal: {
		type: Number,
		default: 400
	}
});

module.exports = User = mongoose.model('users', UserSchema);
