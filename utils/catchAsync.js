// 感觉有点像函数签名重载
const catchAsync = fn => {
	// 返回一个匿名函数给 const定义的那个常量，这个返回的函数执行传入catchAsync的函数fn，并调用catch捕获异常
	return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
exports.catchAsync = catchAsync;
