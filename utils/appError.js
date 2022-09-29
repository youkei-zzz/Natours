class AppError extends Error {
	constructor(message, statusCode) {
		// 父类中调用 this.message = message  然后通过extends AppError 也有了message
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'success';
		// 意思是设置只发送由用户输入错误时返回的提示信息 如果是 编程出错或者是 第三方包出错 不应该给用户发错误信息
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
