const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: `./config.env` }); // 读取 数据库链接的配置
const { app } = require('./app');

// 并不需要为这种异常处理 需要处理的异常是那些异步回来却没有被处理的异常，所以此处不需要server.close(...)
// 需要把这个放在所有代码之上，这样在整个程序中都能捕获到这种同步发生的异常，否则连console.log(x) 这种未定义的错误都捕获不到
// 需要注意的是 如果把 console.log(x) 放在全局注册的中间件中 如 app.js中的 add timeStamp功能的中间件中 ， 这个错误是无法被捕获到的，但在Production模式中发送请求 会受到错误信息(something went wrong) dev模式中受到的信息会具体一点 是 x is not defined。所以需要自己处理这个 因为 "未定义"而发生的错误
process.on('uncaughtException', err => {
	console.log('😥 Unhandled Exception , Shutting down soon...');
	console.log('😥 ', err.name, err.message);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('👌 -> DB is connected!\n');
	});

console.log(process.env.NODE_ENV);

// server
const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
	console.log(`app is running at ${port}!\n`);
});

process.on('unhandledRejection', err => {
	console.log('😥 Unhandled Rejection , Shutting down soon...');
	console.log('😥 ', err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
// console.log(x)

