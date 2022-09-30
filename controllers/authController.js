const User = require('../models/userModel.js');
const { catchAsync } = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError.js');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const signup = catchAsync(async (req, res, next) => {
	// 防止一个漏洞：只选择我们需要的数据 而不是把用户输入的所有数据一起创建文档
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
		role: req.body.role,
	});

	const token = signToken(newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser,
		},
	});
});
exports.signup = signup;

// async返回Promise可能有错误产生，又不想用重复的 try ... catch  就用我们包装的 catchAsync函数const
const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	// 1.检查email password 是否存在  (在调用中间件后 使login函数马上结束  否则又会发送两个 Headers 过去 又会报错)
	if (!email || !password) {
		return next(new AppError('Please provide email or password!', 400));
	}
	// 2.检查用户是否存在 和 密码是否正确 (由于设置了password字段在数据库查询时不选择输出这里可以手动选择输出 用 "+" + 字段名)
	// 使用await能接收到查询的数据 不然只能看到一堆 query语句配置
	const user = await User.findOne({ email }).select('+password');
	// 由于correctPassword是异步函数因此也要等待结果返回 (这个函数是userModel.js中通过 Schema.methods方法挂载到实例对象 身上 的)
	const correct = await user.correctPassword(password, user.password);
	if (!user || !correct) {
		return next(new AppError('incorrect email or password!', 401));
	}

	// 3.都满足 发送token到客户端
	const token = signToken(user._id);
	res.status(200).json({
		status: 'success',
		token,
	});
});
exports.login = login;

// 要么不用catchAsync包裹 要么用了就一定要 用async 修饰 否则执行 getAllTour时会报错   Cannot set headers after they are sent to the client
const protect = catchAsync(async (req, res, next) => {
	let token;
	// 1.获取令牌并检查它是否在那里
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1]; // Bearer 与 token之间是有一个空格的!
	}
	if (!token)
		return next(new AppError('You are not logged in! Please long in to get access.', 401));

	// 2.验证令牌
	const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	// console.log(decode) //{ id: '6336311330b1f942148af428', iat: 1664499558, exp: 1672275558 }

	// 3.检查用户是否仍然存在 (虽然token有效且正确 但是如果数据库中已经删除这个用户 那么也不能访问被保护的路由 )
	const currentUser = await User.findById(decode.id);
	if (!currentUser) {
		// 好家伙 ！ 这里要注意 next(new ....)进入的下一个中间件并不是 getAllTour，而是直接从tourRoutes出去到app.js 也不会匹配到app.all('*',...) 直接进入globalErrorHandler中间件中
		return next(new AppError('This token owner does not exist!', 404));
	}

	// 4.检查用户在颁发令牌后是否更改了密码 ( 签发token后用户的密码改了 那么也不能访问被保护的路由)
	if (currentUser.changedPasswordAfter(decode.iat)) {
		return next(new AppError('Password has been changed by user!', 401));
	}

	// 验证通过 授予访问GetAllTour的权限
	req.user = currentUser; // 便于后面的中间件访问查询角色权限等的各种数据，非常有意义
	next();
});
exports.protect = protect;

const restrictTo = (...roles) => {
	return (req, res, next) => {
		// 错误的写为req.current.role 显示的报错不对
		if (!roles.includes(req.user.role)) {
			return next(new AppError("You don't have permission to access this action", 403));
		}

		next();
	};
};
exports.restrictTo = restrictTo;
