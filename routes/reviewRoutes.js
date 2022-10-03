const express = require('express');
const { protect, restrictTo } = require('../controllers/authController.js');
const {
	getAllReview,
	createReview,
	deleteReview,
	updateReview,
	getReview,
} = require('../controllers/reviewController.js');

//如果要通过子路由从父路由访问参数，则需要将合并参数传递为 true。
const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/').get(getAllReview).post(restrictTo('user'), createReview);
router
	.route('/:id')
	.get(getReview)
	.patch(restrictTo('user', 'admin'), updateReview)
	.delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
