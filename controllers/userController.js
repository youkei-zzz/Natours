const User = require('../models/userModel.js');
const AppError = require('../utils/appError.js');
const { catchAsync } = require('../utils/catchAsync.js');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el]; // 把值过滤出来
	});
	return newObj;
};

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
// 管理员更新用户
const updateUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'not defined!',
	});
};
exports.updateUser = updateUser;

const updateMe = async (req, res, next) => {
	// 1) 如果用户 POST 密码数据，则创建错误  因为这里只负责除了密码以外的数据(因此可以用 findByIdAndUpdate)
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
		);
	}
	// 2) 过滤掉了不允许更新的不需要的字段名称(比如 用户不能把自己更新为管理员....)
	const filteredBody = filterObj(req.body, 'name', 'email');
	if (req.file) filteredBody.photo = req.file.filename;

	// 3) 更新用户文档
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true, //  返回更新后的对象
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	});
};
exports.updateMe = updateMe;
