
// express的路由里抛出异常后，全局中间件没办法捕获，需要在所有的路由函数里写try catch，这坑爹的逻辑让人每次都要多写n行代码

// 参照 http://www.qb5200.com/article/360363.html
const catchAsync = fn => {
	// 返回一个匿名函数给 const定义的那个常量，这个返回的函数执行传入catchAsync的函数fn，并调用catch捕获异常
	return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
exports.catchAsync = catchAsync;
