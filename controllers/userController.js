const User = require('../models/userModel.js');
const AppError = require('../utils/appError.js');
const multer = require('multer'); // 上传文件
const factory = require('../controllers/handleFactory.js');

exports.getAllUser = factory.getAllxx(User);
exports.getUser = factory.getOnexx(User);
exports.updateUser = factory.updateOnexx(User); // 管理员更新用户 (没有protect中间件 因此不要在这里改密码)
exports.deleteUser = factory.deleteOnexx(User);

const multerStorage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './public/img/users/');
	},
	filename: (req, file, callback) => {
		// user-userid-timeStamp
		const ext = file.mimetype.split('/')[1];
		callback(null, `user-${req.user.id}-${Date.now()}.${ext}`); // 第一个参数是表示错误信息,userid是防止用户先后上传的图片被覆盖，timeStamp是防止多个用户上传的文件名字重复
	},
});

const multerFilter = (req, file, callback) => {
	if (file.mimetype.startsWith('image')) {
		callback(null, true);
	} else {
		callback(new AppError('Not an image. Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	// dest: './public/img/users',//上传路径
}); 

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req,res, next)=>{
	if(!req.file) return next();
}

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el]; // 把值过滤出来
	});
	return newObj;
};
//   deprecated  !!!!!
exports.updateMe = async (req, res, next) => {
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
//   deprecated  !!!!!
exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'not defined! Please use /signup instead!!!',
	});
};
``