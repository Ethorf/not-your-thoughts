const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});
		console.log('NYT mongoDB connected...');
	} catch (err) {
		console.error(err.message);
		// exit process w/ failure
		process.exit(1);
	}
};

module.exports = connectDB;
