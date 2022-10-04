const Review = require('../models/reviewModel.js');
const factory = require('./handleFactory.js');


exports.setTourUserIds = (req, res, next) => {
  // 允许嵌套路由
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReview = factory.getAllxx(Review);

exports.createReview = factory.createOnexx(Review);
exports.getReview = factory.getOnexx(Review);
exports.deleteReview = factory.deleteOnexx(Review);
exports.updateReview = factory.updateOnexx(Review);
