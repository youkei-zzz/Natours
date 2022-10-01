const Review = require('../models/reviewModel.js');
const AppError = require('../utils/appError.js');
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
	const newReview = await Review.create(req.body);
	res.status(201).json({
		status: 'success',
		data: {
			reviews: newReview,
		},
	});
});
