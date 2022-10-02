const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel.js');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name!'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour must have less or equal than 40 characters!'],
            minlength: [10, 'A tour must have more or equal than 10 characters!'],
            // 完整写法为priceDiscount中验证器的写法
            // validate: [validator.isAlpha,'Tour name must only contain characters!'],
        },
        slug: {type: String},
        duration: {type: Number, required: [true, 'A tour must have a duration!']},
        maxGroupSize: {type: Number, required: [true, 'A tour must have a group size!']},
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty!'],
            enum: {
                values: ['easy', 'difficult', 'medium'],
                message: 'Type only be allowed to easy,difficult or medium!',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [1, 'ratingsAverage must be above 1.0 !'],
            max: [5.0, 'ratingsAverage must be below 5.0 !'],
        },
        ratingQuntity: {type: Number, default: 0},
        rating: {type: Number, default: 4.5},
        price: {type: Number, required: [true, 'a tour must have a price!']},
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // val是当前字段的值 , this 指向当前正在创建的新的文档  ，所以这个功能 在更新时不起作用
                    return val < this.price;
                },
                message: 'Discount ({VALUE}) must below the original price!',
            },
        },
        summary: {type: String, trim: true, required: [true, 'A tour must have a summary!']},
        description: {type: String, trim: true},
        imageCover: {type: String, required: [true, ' A tour must have a image']},
        images: [String],
        createdAt: {type: Date, default: Date.now()},
        startDates: [Date],
        secretTour: {type: Boolean, default: false},
        //嵌入文档
        startLocation: {
            // GeoJSON  与地理位置有关的JSON格式
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);
// 虚拟填充   注意 这里的虚拟名称不能和本模型中的真实字段名称重复 否则报错    tour被ReviewModel 中的
tourSchema.virtual('reviews', {
    ref: 'Review', // 关联的模型
    foreignField: 'tour',//外键,关联模型Option的tour字段
    localField: '_id'// 内键,schema对应的模型的_id
});

// 必须使用 普通函数的形式
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// MongoDB 中间件 :

// 在schema中指定一个guides数组 填写的时候把ID写在body里面，通过  手动  的查询并赋值给guides ， 但是 我们还可以用 另外一个类型来实现自动的嵌入文档
// tourSchema.pre('save', async function (next) {
// 	// 创建的时候 body.guides里面填的是id
// 	const guidesPromise = this.guides.map(async id => User.findById(id));
// 	this.guides = await Promise.all(guidesPromise);
// });

tourSchema.pre('save', function (next) {
    // this 指向当前的需要被保存进MongoDB的文档
    console.log('create 方法被调用！');
    this.slug = slugify(this.name, {lower: true});
    next();
});

//如果不用正则表达式 find 在执行 find时 有效 但是 在执行 findOne() findById() findOneAndUpdate() 时 不会进入这个钩子
// 使用正则表达式则匹配的都进入
// pre 表示前置
tourSchema.pre(/^find/, function (next) {
    console.log('pre 中间件被调用!');
    // this 指向 ApiFeature中的参数 Tour.find()
    this.start = Date.now();
    this.find({secretTour: {$ne: true}});
    next();
});

// post(意思是后置 而不是post方法)中间件会在所有钩子方法及pre中间件执行完毕后执行。
tourSchema.post(/^find/, function (doc, next) {
    console.log(' post(☞后置的意思)中间件 被调用！');
    console.log(`Query took ${Date.now() - this.start} ms`);
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({path: 'guides', select: '-__v -passwordChangedAt'});
    next();
});

// Aggregation MiddleWare
tourSchema.pre('aggregate', function (next) {
    // 指向当前的aggregate
    console.log('aggregate 中间件被调用');
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
    next();
});

const Tour = mongoose.model('Tour', tourSchema);
exports.Tour = Tour;
