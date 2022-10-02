const Review = require('../models/reviewModel.js');
const { catchAsync } = require('../utils/catchAsync.js');

exports.getAllReview = catchAsync(async (req, res, next) => {
	const reviews = await Review.find();
	res.status(200).json({
		status: 'success',
		result: reviews.length,
		data: {
			reviews,
		},
	});
});

exports.createReview = catchAsync(async (req, res, next) => {
	if (!req.body.tour) req.body.tour = req.params.tourId;
	// 如果没有指定body  就用上一个中间件protect检查后的 挂载的user对象
	if (!req.body.user) req.body.user = req.user.id;

	const newReview = await Review.create(req.body);
	res.status(201).json({
		status: 'success',
		data: {
			reviews: newReview,
		},
	});
});
