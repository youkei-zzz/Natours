const Tour = require('../models/tourModel.js');
const AppError = require('../utils/appError.js');
const { catchAsync } = require('../utils/catchAsync.js');

function GMTToStr(time) {
	let date = new Date(time);
	let Str =
		date.getFullYear() +
		'-' +
		(date.getMonth() + 1) +
		'-' +
		date.getDate() +
		' ' +
		date.getHours() +
		':' +
		date.getMinutes() +
		':' +
		date.getSeconds();
	return Str;
}

exports.getOverview = catchAsync(async (req, res, next) => {
	const tours = await Tour.find();
	// 改变时间格式
	tours.forEach(tour => {
		tour.startDates[0] = GMTToStr(tour.startDates[0]);
		tour.startDates[1] = GMTToStr(tour.startDates[1]);
		tour.startDates[2] = GMTToStr(tour.startDates[2]);
	});
	//
	res.status(200).render('overview', {
		title: 'All Tours',
		tours,
	});
});
exports.getTour = catchAsync(async (req, res, next) => {
	// 正因为填充了过后 后面在tour.pug页面上 才能使用 在遍历guides时取出每一个guide对象获取对应的key-value
	const tour = await Tour.find({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user',
	});
	// console.log(tour[0].guides);
	if (!tour.length) {
		return next(new AppError('There is no tour with that name', 404));
	}

	res.status(200).render('tour', {
		title: tour[0].name,
		tour,
	});
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
	res.status(200).render('login', {
		title: 'Log into your account',
	});
});

exports.getAccount = (req, res) => {
	res.render('account', {
		title: 'Your account',
	});
};

exports.updateUserData = catchAsync(async (req, res, next) => {
	console.log('😁😁:');
	// const updatedUser = await findByIdAndUpdate(
	// 	req.user.id,
	// 	{
	// 		name: req.body.name,
	// 		email: req.body.email,
	// 	},
	// 	{
	// 		new: true,
	// 		runValidators: true,
	// 	}
	// );
	// res.status(200).json({
	// 	title:'Your account',
	// 	user: updatedUser,
	// })
	console.log(req.body);
});
