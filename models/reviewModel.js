const mongoose = require('mongoose');
// 当我们设置一个 虚拟的属性 reviewSchema.virtual('propertyName')...  (之前没有存放在数据库中,只是由数据库中已存在的数据计算出来的再被我们临时用来输出的字段) 想要这个属性能够正常显示出来 就需要第二个配置项
const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Review can not be empty!']
		},
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		createdAt: {
			type: Date,
			default: Date.now()
		},
		tour: {
			// 数据库中是以Id为内容的  自己看看数据库里面就知道了
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour.']
		},
		user: {
			// 数据库中是以Id为内容的  自己看看数据库里面就知道了
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user']
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

reviewSchema.pre(/^find/, function (next) {
	// 在此处若再填充 tour 就会循环往复 形成链式一样的死循环
	// this.populate({ path: 'tour', select: 'name' }).populate({ path: 'user', select: 'name photo' });
	this.populate({ path: 'user', select: 'name photo' });
	next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
