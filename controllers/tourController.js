const Tour = require('../models/tourModel.js');
const AppError = require('../utils/appError.js');
const { catchAsync } = require('../utils/catchAsync');
const factory = require('./handleFactory.js');

exports.getAllTours = factory.getAllxx(Tour);

exports.getTour = factory.getOnexx(Tour, { path: 'reviews' });

exports.createTour = factory.createOnexx(Tour);

exports.updateTour = factory.updateOnexx(Tour);

exports.deleteTour = factory.deleteOnexx(Tour);

// 展示前五
exports.aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};
exports.getTourStats = catchAsync(async (req, res, next) => {
	// 不加await 聚合管道返回的是aggregte参数 可由apiPost看到
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } },
		},
		{
			$group: {
				_id: '$difficulty',
				numTours: { $sum: 1 },
				numRatings: { $sum: '$ratingsQuantity' },
				avgrating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' },
			},
		},
		{
			$sort: { avgPrice: 1 },
		},
		// { $match: { $ne: 'easy' } },
	]);
	res.status(200).json({
		status: 'success',
		data: {
			stats,
		},
	});
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	console.log(req.params);
	const year = req.params.year * 1;
	const monthlyPlan = await Tour.aggregate([
		{
			// $unwind 从输入文档解构数组字段，以输出每个元素的文档。每个输出文档都将数组替换为元素值。对于每个输入文档，输出 n 个文档，其中 n 是数组元素的数目，对于空数组，可以为零。
			$unwind: '$startDates',
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`),
				},
			},
		},
		{
			// 按某个指定的表达式对文档进行分组，并将每个不同分组的文档输出到下一阶段。输出文档包含一个_id字段，该字段包含按键的不同组。输出文档还可以包含计算字段，这些字段保存按$group_id字段分组的某个累加器表达式的值。$group不对其输出文档进行排序。
			$group: {
				// _id指定为 开始日期的月份 且以Number类型返回 按id分组 。参见api文档
				_id: { $toUpper: '$difficulty' },
				// _id的值相同保存入同一组,就 +1 (相当于统计)。返回数值的总和，忽略非数值。在 3.2 版更改： 提供$group和$project阶段。
				numTourStarts: { $sum: 1 },
				// 	返回每个组的表达式值数组。仅在$group阶段提供。
				tours: { $push: '$name' },
			},
		},
		{
			$addFields: { difficulty: '$_id' },
		},
		{
			$project: { _id: 0 },
		},
		{
			$sort: { numTourStarts: -1 },
		},
		{
			$limit: 6,
		},
	]);

	res.status(200).json({
		status: 'success',
		data: {
			monthlyPlan,
		},
	});
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');

	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if (!lat || !lng) {
		next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
	}

	const tours = await Tour.find({
		startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours,
		},
	});
});

exports.getDistances = catchAsync(async (req, res, next) => {
	const { latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');

	const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

	if (!lat || !lng) {
		next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
	}

	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1],
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier,
			},
		},
		{
			$project: {
				distance: 1,
				name: 1,
			},
		},
	]);

	res.status(200).json({
		status: 'success',
		data: {
			data: distances,
		},
	});
});
