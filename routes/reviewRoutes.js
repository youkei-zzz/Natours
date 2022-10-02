const express = require('express');
const { protect, restrictTo } = require('../controllers/authController.js');
const { getAllReview, createReview } = require('../controllers/reviewController.js');

const router = express.Router();

router.route('/').get(getAllReview).post(protect, restrictTo('user'), createReview);

module.exports = router;
