const User = require('../models/userModel.js');
const { catchAsync } = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError.js');
const sendEmail = require('../utils/email.js');
const crypto = require('crypto');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};
const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') {
		cookieOptions.secure = true;
	}
	// 后面的中间件都可以用req.headers 里面 有cookie 和 authorization 两个属性 都是生成的这个jwt
	res.cookie('jwt', token, cookieOptions);

	// 从输出中删除密码
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	// 防止一个漏洞：只选择我们需要的数据 而不是把用户输入的所有数据一起创建文档 注意其他的都要改
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
		role: req.body.role,
	});

	createSendToken(newUser, 201, res);
});

// async返回Promise可能有错误产生，又不想用重复的 try ... catch  就用我们包装的 catchAsync函数const
exports.login = catchAsync(async (req, res, next) => {
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
	createSendToken(user, 200, res);
});

// 要么不用catchAsync包裹 要么用了就一定要 用async 修饰 否则执行 getAllTour时会报错   Cannot set headers after they are sent to the client
// 想要通过检查 就要登录或注册因为这里面调用了res.cookie方法使得req,headers.authorization才能看见 这是关键
exports.protect = catchAsync(async (req, res, next) => {
	let token;
	// 1.获取令牌并检查它是否在那里  (由于  login 或者是singup 都调用了createSendToken函数 ，这个函数使用res.cookie 方法之后 下一个中间件就可以在req.headers.cookie或者是req.headers.authorization 里面看到关于token的信息)
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1]; // Bearer 与 token之间是有一个空格的!
	} else if (req.cookies.jwt) {
		// 因为登录后会发送一个cookie保存在浏览器 ， 此时用户也可以通过这个保存在浏览器的cookie来来进行下一步操作 因此也要有这一个判断
		// 前提是在app.js 中使用了 cookie parser 中间件
		token = req.cookies.jwt;
	}
	if (!token)
		return next(new AppError('You are not logged in! Please long in to get access.', 401));

	// 2.验证令牌 (promisfy 将一个函数转化成异步的函数并以可使用then)
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

exports.renderLoggedIn = catchAsync(async (req, res, next) => {
	if (req.cookies.jwt) {
		const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

		const currentUser = await User.findById(decode.id);
		if (!currentUser) {
			return next();
		}

		// 4.检查用户在颁发令牌后是否更改了密码 ( 签发token后用户的密码改了 那么也不能访问被保护的路由)
		if (currentUser.changedPasswordAfter(decode.iat)) {
			return next();
		}

		// 用户确实登录了
		console.log(res.locals)
		res.locals.user = currentUser;
		return next();
	}
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// 错误的写为req.current.role 显示的报错不对
		if (!roles.includes(req.user.role)) {
			return next(new AppError("You don't have permission to access this action", 403));
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1.通过邮件中的邮箱中获取用户
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('There is no user with email address', 404));
	}

	// 2.生成随机的重置token 保存到文档上 并返回这个token过来
	const resetToken = user.createPasswordResetToken();
	// 上一步执行完了以后往往所有文档里增添了一个字段 但是还未保存 这里就执行一下保存使文档数据更新 ，但是不需要在执行 save的时候验证字段(目的只是为了保存)
	await user.save({ validateBeforeSave: false });
	// await user.save();

	// 3. 发送生成的token给用户
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
	const message = `Forgot Password? Just submit a patch request with yourr password and passConfirm to: ${resetURL}.\nIf you did't forgot please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 minutes!)',
			message,
		});
		res.status(200).json({
			status: 'success',
			message: 'Token send to email!',
		});
	} catch (error) {
		//发送邮件出错了，那么保存这两个属性也没必要，本来这两个属性就是用来重置密码时验证用的，因此把查询的文档中的两个字段重置为undefined不让这两个字段显示 并执行保存
		user.passwordResetToken = undefined;
		user.passwordExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('Errors hanppen while sending email, Try again later!', 500));
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1.把通过邮件发送的url中的参数拿来生成token 再加密后与原来比较 (以下是邮箱大致的格式)
	/* 
			Forgot Password? Just submit a patch request with yourr password and passConfirm to: http://127.0.0.1:3000/api/v1/users/resetPassword/84437bd0fbc25c1896d3002a6dd1e16268a192e7167fcb8a29981e23adb8a570.
			If you did't forgot please ignore this email!
	*/
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	// 2.查询用户
	const user = await User.findOne({
		// token一样
		passwordResetToken: hashedToken,
		// token一样还不够 还要保证过期的时间是在将来
		passwordResetExpires: { $gt: Date.now() },
	});

	// 查不到
	if (!user) {
		return next(new AppError('This token is invalid or expired!', 400));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	// 重置为undefined的值在MongoDB中是不出现的 所以又把它们从库中删去了 等到有一天有忘记密码时 调用userModel.js中的createPasswordResetToken再临时创建
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	// 执行保存MongoDB数据库
	await user.save();

	// 3.更新 用户的changedPasswordAfter
	// 4.重新发送新的token
	// const token = signToken(user._id);
	// res.status(200).json({
	// 	status: 'success',
	// 	token,
	// });
	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('The password you have entered is wrong!', 401));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	// 这次在刷新保存文档时，希望要有验证 所以没有添加参数来关闭验证
	await user.save();
	// user.findByIdAndUpdate()  在这里不会起作用 !!!!!! 同样pre('save'，xxx)中间件也不会在findByIdAndUpdate时执行，因此如果用这个就不会有自动在保存文档时增加时间戳和加密功能了

	// 把从数据库中获取到的id转换成token发送给用户
	// const token = signToken(user._id);
	// res.status(200).json({
	// 	status: 'success',
	// 	token,
	// });
	createSendToken(user, 200, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null,
	});
});
