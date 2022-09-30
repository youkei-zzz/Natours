const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 中间件 执行顺序和位置有关  全局生效 即 所有请求都会经过
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// 转化 apipost传入的json格式数据
app.use(express.json());

// 设置在浏览器中展示的静态资源
app.use(express.static(`${__dirname}/public`));

// add timeStamp
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	// console.log(x) // Express 会在发生错误时 自动的进入 错误处理中间件中  所以production 模式下 控制台输出 " Error hanppened 🤷‍♀ ...."
	next();
});
// 匹配对应路由的中间件
app.use('/api/v1/tours', tourRouter); // 如果路径匹配但中途出错或者是什么情况 要有next()跳出这个中间件 进入下一个 ，下一个因为路径是user匹配不上 所以进入all('*') 里面
app.use('/api/v1/users', userRouter);

// 位置要放在最后面 不然都被拦截了
// 如果之前的路由没匹配上则说明这个 url有问题，all表明无论get post patch.... 只要没进入上面正确的路由那么都会被这个匹配，进入这个处理  所以上面的tourRouter路由里面要写 next()
app.all('*', (req, res, next) => {
	console.log('app.all');
	// 进入all后用next再转入下一个中间件 globalErrorHandler， 顺带这样能传参 给globalErrorHandler 函数初始化 不然也正确 但返回的内容就不太一样了
	// 如果next( new AppError(....) ) 那么就直接进入最后一个中间件都不用到这一个中间件了
	next(new AppError(`can't find  ${req.originalUrl}  on this server!`, 404));
});

// 最后一个中间件
app.use(globalErrorHandler);

exports.app = app;
