const Tour = require('../models/tourModel.js');
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
exports.getTour = catchAsync(async (req, res) => {
	// 正因为填充了过后 后面在tour.pug页面上 才能使用 在遍历guides时取出每一个guide对象获取对应的key-value
	const tour = await Tour.find({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user',
	});
	// console.log(tour[0].guides);

	res.status(200).render('tour', {
		title: tour[0].name,
		tour,
	});
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
    res.status(200).render('login',{
			title:'Log into your account',
		})
});
