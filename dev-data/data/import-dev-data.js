const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
	path: `./config.env`,
});
const Tour = require('../../models/tourModel.js');
const User = require('../../models/userModel.js');
const Review = require('../../models/reviewModel.js');

dotenv.config({ path: '../../config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('👌 -> DB is connected!\n');
	});
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA
const importData = async () => {
	try {
		await Tour.create(tours);
		await User.create(users, { validateBeforeSave: false });
		await Review.create(reviews);
		console.log('Data successfully import!');
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

// DELETE DATA
const deletetData = async () => {
	try {
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('Data successfully delete!');
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

// importData();
if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deletetData();
}
