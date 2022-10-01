const mongoose = require('mongoose');
// 当我们设置一个 虚拟的属性 reviewSchema.virtual('propertyName')...  (之前没有存放在数据库中,只是由数据库中已存在的数据计算出来的再被我们临时用来输出的字段) 想要这个属性能够正常显示出来 就需要第二个配置项
const reviewSchema = mongoose.Schema(
	{
		review: { type: String, required: [true, 'Review can not be empty!'] },
		rating: { type: Number, min: 1, max: 5 },
		createdAt: { type: Date, default: Date.now() },
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour!'],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user!'],
		},
	},
 
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
