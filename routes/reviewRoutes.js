const express = require('express');
const { protect, restrictTo } = require('../controllers/authController.js');
const { getAllReview, createReview } = require('../controllers/reviewController.js');

const router = express.Router();

router.route('/').get(protect, restrictTo('user'), getAllReview).post(createReview);

module.exports = router;
