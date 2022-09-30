const User = require('../models/userModel.js');
const { catchAsync } = require('../utils/catchAsync.js');

const getAllUser = catchAsync(async (req, res) => {
	const users = await User.find();

	res.status(200).json({
		status: 'success',
		result: users.length,
		data: {
			users,
		},
	});
});
exports.getAllUser = getAllUser;
const createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'not defined!',
	});
};
exports.createUser = createUser;
const deleteUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'not defined!',
	});
};
exports.deleteUser = deleteUser;
const getUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'not defined!',
	});
};
exports.getUser = getUser;
const updateUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'not defined!',
	});
};
exports.updateUser = updateUser;
