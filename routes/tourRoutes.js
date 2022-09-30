const express = require('express');
const { protect, restrictTo } = require('../controllers/authController.js');
const router = express.Router();
const {
	getAllTours,
	createTour,
	getTour,
	updateTour,
	deleteTour,
	aliasTopTours,
	getTourStats,
	getMonthlyPlan,
	// checkBody,
	// checkID
} = require('../controllers/tourController');

// 如果有参数 才会进入这个中间件  getAllTour不会进入  param 方法 的回调 function（req， res， next， id中） 所以 checkID也要符合
// router.param('id', checkID) // param(name: string, handler: RequestParamHandler): Router
// router.route('*').get(checkBody,checkID)

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
// 验证用户合法性后再进行下一步
router.route('/').get(protect, getAllTours).post(createTour);

router
	.route('/:id')
	.get(getTour)
	.patch(updateTour)
	.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router.route('/top').get(aliasTopTours, getAllTours);

module.exports = router;
