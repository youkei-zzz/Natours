const { Tour } = require('../models/tourModel.js');
const { APIFeatures } = require('../utils/ApiFeatures');
const AppError = require('../utils/appError.js');
const { catchAsync } = require('../utils/catchAsync');

//#region
// 本页面的所有中间件都是按顺序执行

//
// 将脚本对象表示法 （JSON） 字符串转换为对象。
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (req, res, next, val) => {
// 	console.log(`tour id is ${val}`);
// 	next();
// };

// check whether the Body have attributes of name and price
// exports.checkBody = (req, res, next) => {
// 	if (req.body && 'name' in req.body || 'price' in req.body) {
// 		console.log('▶️ pass');
// 		next();
// 	} else {
// 		res.status(400).json({
// 			message: 'Body not have attributes of name and price,not allowed!',
// 			status: 404,
// 		});
// 	}
// };
//#endregion

// 展示前五
const aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};
exports.aliasTopTours = aliasTopTours;

const getAllTours = catchAsync(async (req, res, next) => {
	// 2.EXCUTE QUERY
	const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
	const tours = await features.query;

	// 3.SEND RESPONSE
	res.status(200).json({
		status: 'success',
		requestTime: req.requestTime,
		results: tours.length,
		data: {
			tours,
		},
	});
});
exports.getAllTours = getAllTours;

const getTour = catchAsync(async (req, res, next) => {
	const id = req.params.id.trim();
	const tour = await Tour.findById(id);
	if (!tour) {
		// console.log('👉')
		// return 提前退出函数 并用next进入app中的下一个中间件
		// 同时return 能避免在转转转 转到 errorController.js 里面 使用res方法返回时 这里又执行 res方法 '会报错 Cannot set headers after they are sent to the client'
		// 不return会报错 Cannot set headers after they are sent to the client
		// return next(new AppError('No Tour Found With that ID!', 404));
		return next();
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour,
		},
	});
});
exports.getTour = getTour;

const createTour = catchAsync(async (req, res, next) => {
	// console.log('👉');
	const newTour = await Tour.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			tour: newTour,
		},
	});
});
exports.createTour = createTour;

const updateTour = catchAsync(async (req, res, next) => {
	console.log(req.params);
	console.log(req.body);

	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!tour) {
		// return 提前退出函数 并用next进入app中的下一个中间件
		// 同时return 能避免在转转转 转到 errorController.js 里面 使用res方法返回时 这里又执行 res方法 '会报错 Cannot set headers after they are sent to the client'
		// 不return会报错 Cannot set headers after they are sent to the client
		return next(new AppError('No Tour Found With that ID!', 404));
	}

	res.status(200).json({
		status: 'success ',
		data: {
			tour,
		},
	});
});
exports.updateTour = updateTour;

const deleteTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findOneAndDelete(req.params.id);

	if (!tour) {
		// return 提前退出函数 并用next进入app中的下一个中间件
		// 同时return 能避免在转转转 转到 errorController.js 里面 使用res方法返回时 这里又执行 res方法 '会报错 Cannot set headers after they are sent to the client'
		// 不return会报错 Cannot set headers after they are sent to the client
		return next(new AppError('No Tour Found With that ID!', 404));
	}

	res.status(204).json({
		status: 'success ',
		data: null,
	});
});
exports.deleteTour = deleteTour;

const getTourStats = catchAsync(async (req, res, next) => {
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
exports.getTourStats = getTourStats;

const getMonthlyPlan = catchAsync(async (req, res, next) => {
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
exports.getMonthlyPlan = getMonthlyPlan;
