const express = require('express');
const { protect, restrictTo } = require('../controllers/authController.js');
const reviewRouter = require('../routes/reviewRoutes');

const {
	getAllTours,
	createTour,
	getTour,
	updateTour,
	deleteTour,
	aliasTopTours,
	getTourStats,
	getMonthlyPlan,
	getToursWithin,
	getDistances,
} = require('../controllers/tourController.js');

const router = express.Router();

// 如果有参数 才会进入这个中间件  getAllTour不会进入  param 方法 的回调 function（req， res， next， id中） 所以 checkID也要符合
// router.param('id', checkID) // param(name: string, handler: RequestParamHandler): Router
// router.route('*').get(checkBody,checkID)

// 路径末尾匹配 reviews 就会进入这个中间件  在这个中间件内需要开启 express.Router({mergeParams: true});接收 父路由参数 否则会报错 :  Review must belong to a tour
router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide','guide'),getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
	.route('/')
	.get(getAllTours)
	.post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
	.route('/:id')
	.get(getTour)
	.patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
	.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router.route('/top').get(aliasTopTours, getAllTours);
module.exports = router;
