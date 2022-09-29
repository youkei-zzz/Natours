const AppError = require('../utils/appError');

// 这里是处理从数据库来的对用户来说无意义的字段的函数

// 处理CastError错误 ("message": "Cast to ObjectId failed for value \"1234\" (type string) at path \"_id\" for model \"Tour\"",)
const handleCastErrorInDB = err => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	// 返回手动创建的Error对象
	return new AppError(message, 400);
};
// 创建名称相同的用户时 名称重复 处理MongoDB报错
const handleDuplicateFieldsDB = err => {
	const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
	console.log(value);

	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);

	const message = `Invalid input data: ${errors.join('. ')}`;
	return new AppError(message, 400);
};

// 简单的包装一下 没什么别的意思
const SendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message, // err 继承Error的 message 属性
		error: err,
		stack: err.stack,
	});
};

const SendErrorPro = (err, res) => {
	// 客户端输入错误
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message, // err 继承Error的 message 属性
		});
	}
	// 编程出错或者是 第三方包出错
	else {
		console.error('Error hanppened 🤷‍♀ ....');
		// 发送信息给客户端
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong!', // 发一条通用的消息
		});
	}
};

// 参数这样设置为4个 Express 就能识别为这是一个错误中间件
module.exports = (err, req, res, next) => {
	// 参数err就是 app.js 中 next(new AppError....)中new 的这个值  console.log(err)
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		SendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = err; // 不改变原来的错误信息.  (这儿第一次似乎写错了 写成了 {...err},err展开好像并没有name属性)
		// 如果返回给客户端的信息中有一些没多大意义的字段 我们可以重新设置err对象 再返回给客户端
		if (error.name === 'CastError') error = handleCastErrorInDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

		SendErrorPro(error, res);
	}
};
