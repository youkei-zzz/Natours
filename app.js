const express = require('express');
const morgan = require('morgan'); // 用于在开发环境下输出一些信息
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');
const rateLimit = require('express-rate-limit'); // 防过多次数来自同一IP的请求 也许是攻击
const helmet = require('helmet'); // 增加安全的HTTP Headers
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 全局生效中间件 执行顺序和位置有关  全局生效 即 所有请求都会经过 :

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// 用来设置一些安全的 HTTP Headers  所以应该把它放在最上面的位置 而不是放在后面 甚至是最下面
app.use(helmet()); // helmet() 返回另一个函数 等在这里 直到到达这个全局中间件后被调用

// 一小时内同一个IP请求超过一百次就不通过 。 max 应该依据程序填写而不是随意
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'We have received too many requests from this IP, try again one hour later!',
});
app.use('/api', limiter); // 给所有的api接口都使用

//Body parser, 从 body数据中读取json数据转换为 req.body。 json()中可以传配置项
// limit: 控制最大请求正文大小。如果这是一个数字，则该值指定字节数;如果是字符串，则该值将传递到字节库进行解析。默认值为“100kb
//  配置项有：inflate limit type verify
app.use(express.json({ limit: '10kb' }));

// 通过中间件 针对非SQL查询注入的数据进行清理  ( 例如使用: "email": {"$gt": "" }, password:pass1234  一样的可以登录)
app.use(mongoSanitize());

// duixss攻击 数据进行清理   (例如: 注册用户时写成  "name": "<div id='badCode'>Name</div>" )
app.use(xss());

// 防止参数污染  注意 有时候要查询同一个参数但有多个条件的时候 也会被过滤掉参数 所以 我们 可以进入hpp中 去把一些参数加入 "白名单" !!!
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	})
);

// 设置在浏览器中展示的静态资源
app.use(express.static(`${__dirname}/public`));

// add timeStamp
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	// console.log(x) // Express 会在发生错误时 自动的进入 错误处理中间件中  所以production 模式下 控制台输出 " The error ' xxxx ' hanppened ⁉️ ....."
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
