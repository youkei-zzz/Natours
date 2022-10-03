const Review = require('../models/reviewModel.js');
const factory = require('./handleFactory.js');

exports.getAllReview = factory.getAllxx(Review);

exports.createReview = factory.createOnexx(Review);
exports.getReview = factory.getOnexx(Review);
exports.deleteReview = factory.deleteOnexx(Review);
exports.updateReview = factory.updateOnexx(Review);
