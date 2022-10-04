const { APIFeatures } = require('../utils/ApiFeatures.js');
const AppError = require('../utils/appError.js');
const { catchAsync } = require('../utils/catchAsync.js');

exports.deleteOnexx = Model =>
	catchAsync(async (req, res, next) => {
		console.log('Factory: ');
		console.log(req.params);
		const document = await Model.findByIdAndDelete(req.params.id);
		if (!document) {
			// return 提前退出函数 并用next进入app中的下一个中间件
			// 同时return 能避免在转转转 转到 errorController.js 里面 使用res方法返回时 这里又执行 res方法 '会报错 Cannot set headers after they are sent to the client'
			// 不return会报错 Cannot set headers after they are sent to the client
			return next(new AppError('No document Found With that ID!', 404));
		}
		res.status(204).json({
			status: 'success ',
			data: null,
		});
	});

exports.updateOnexx = Model =>
	catchAsync(async (req, res, next) => {
		const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!document) {
			// return 提前退出函数 并用next进入app中的下一个中间件
			// 同时return 能避免在转转转 转到 errorController.js 里面 使用res方法返回时 这里又执行 res方法 '会报错 Cannot set headers after they are sent to the client'
			// 不return会报错 Cannot set headers after they are sent to the client
			return next(new AppError('No document Found With that ID!', 404));
		}

		res.status(200).json({
			status: 'success ',
			data: {
				data: document,
			},
		});
	});

exports.createOnexx = Model =>
	catchAsync(async (req, res, next) => {
		const document = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				data: document,
			},
		});
	});

exports.getOnexx = (Model, popuoptions) =>
	catchAsync(async (req, res, next) => {
		// 在查询时用  populate() （可以加入配置项）把字段中 guides字段填充（本质上 populate仍然会创建一个查询 如果程序很小倒无所谓） , 创建时 仍然是 ObjectId的类型,这里为了简化 就放在tourModel.js 里面的pre查询中间件里面
		let query = Model.findById(req.params.id);
		if (popuoptions) query.populate(popuoptions);
		const doc = await query;
		if (!doc) {
			// return 提前退出函数 并用next进入app中的下一个中间件
			// 同时return 能避免在转转转 转到 errorController.js 里面 使用res方法返回时 这里又执行 res方法 '会报错 Cannot set headers after they are sent to the client'
			// 不return会报错 Cannot set headers after they are sent to the client
			// return next(new AppError('No Tour Found With that ID!', 404));
			return next(new AppError('No tour found in that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

exports.getAllxx = Model =>
	catchAsync(async (req, res, next) => {
		// 允许Tour路由嵌套的查询review的GET方法    ！！！好像没有用
		let filter = {};
		if (req.params.tourId) {
			console.log('⭐️ You are searching all the reviews on a specify tour, the nested tourId is :  ' + req.params.tourId);
			filter = { tour: req.params.tourId };
		}
		// 2.EXCUTE QUERY
		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const document = await features.query;


		// 3.SEND RESPONSE
		res.status(200).json({
			status: 'success',
			requestTime: req.requestTime,
			results: document.length,
			data: {
				data: document,
			},
		});
	});
