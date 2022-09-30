### **Mongoing 文档**

[官方文档](https://mongoing.com/docs/reference/operator/aggregation/group.html)

### `1.query、params、body`

```javascript
1). req.query为查询参数对 ? 后面的 &符 连接的所有参数名称。
2). req.body是用在post请求当中的
3). req.prams是对应于后端代码中 :xxx 的部分 ?的前面。
```

### `2.数组方法`

```javascript
1). 如果想删除tableData集合中的name属性，需要用forEach遍历tableData集合，然后在遍历过程中，直接调用 delete item.name ,就可以把集合中的name属性删除掉
```

### `3.JS中的其它方法`

```javascript
1). JSON.parse()用于从一个字符串中解析出json对象。
2). JSON.stringify()用于将一个json对象解析成字符串形式
```

### `4.使用优化`

```javascript
//build query
const query = Tour.find(queryObj);
// 2.excute query
const tours = await query;
// 这样可以不用等待 find查询并返回文档的过程使得分页排序这些卡住，可以加快速度
```

### `5. module.exports与exports.xxx`

> [CSDN](https://blog.csdn.net/interestANd/article/details/119058481)

### `6. $project`

```javascript
将仅包含指定字段的文档传递到管道中的下一阶段。指定的字段可以是输入文档中的现有字段，也可以是新计算的字段

语法	                描述
<字段> : <1 或真>	指定包含字段。
_id : <0 或假>	    指定_id字段的抑制。
<字段>:<表达式>	    添加新字段或重置现有字段的值。
```

### `7. MongoDB中间件`

```javascript
// 1. 只能用 function  2. doc指向正在保存的文档内容 ，在.create()和.save()方法之前会被调用
tourSchema.post("save", function (doc,next) {
	console.log(doc); // 输出执行post的文档信息
	next();
});
--------------------------------------------------------------

// 注意此处的 find 在执行 find时 有效 但是 在执行 findOne() findById() findOneAndUpdate() 时 不会进入这个钩子
tourSchema.pre('find', function (next) {
	.....
	next();
});

tourSchema.pre('findOne', function (next) {
	.....
});
....  // 如此 太麻烦 可以用正则表达式 指定。example:  tourSchema.pre(/^find/, function (next) {...});

//  Aggregation MiddleWare
tourSchema.pre('aggregate', function (next) {
	// 指向当前的aggregate(而且是一个数组 可以用 unshift()来增加 pipeline中的内容 以此来进一步分类、分组或者是过滤...)
		console.log(this);
/*
	Aggregate {
  _pipeline: [
    { '$unwind': '$startDates' },
    { '$match': [Object] },
    { '$group': [Object] },
    { '$addFields': [Object] },
    { '$project': [Object] },
    { '$sort': [Object] },
    { '$limit': 6 }
  ],
  _model: Model { Tour },
  options: {}
}
*/

});
------------------------
2.post中间件回调的参数(使用arguments查看
)
// 有时候参数不对 会使这个钩子 无法被识别
// 有三个，默认传入的第一个是查询出来的文档内容，第二个是若有错误的error信息，第三个是next函数
```

### `8. 处理错误路径(app.js中)`

```javascript
app.use('...', xxx);

// 位置要放在最后面 不然都被拦截了
// 如果之前的路由没匹配上则说明这个 url有问题，all表明无论get post patch.... 只要没进入上面正确的路由那么都会被这个匹配，进入这个处理
app.all('*', (req, res, next) => {
	res.status(404).json({
		status: 'fail',
		message: `can't find ${req.originalUrl}`,
	});
});
```

### `Error.captureStack`

> [CSDN](https://zwkkkk1.blog.csdn.net/article/details/83316772?spm=1001.2101.3001.6650.2&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-2-83316772-blog-120124102.t0_edu_mix&utm_relevant_index=3)

### `9. 关于异步的封装(避免写很多重复的try...catch)`

```javascript
/*  

1.express的路由里抛出异常后，全局中间件没办法捕获，需要在所有的路由函数里写try catch，这坑爹的逻辑让人每次都要多写n行代码  所以单独提取一个catchAsync.js文件 导入其他文件中 使用该方法

2.参照 http://www.qb5200.com/article/360363.html 

*/

// 返回一个匿名函数给 const定义的那个常量，这个返回的函数执行传入catchAsync的函数fn，并调用catch捕获异常
const catchAsync = fn => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};
exports.catchAsync = catchAsync;
```

### `10. 关于MongoDB 中的validate（验证器）何时生效`

```javascript
//
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password!'],
		// 不能使用 ()=> 因为 this 无法指向 创建的文档
		// 这个只在执行 save 或者是 create 操作时有效！！！！！
		validate: {
			validator: function (el) {
				return el === this.password;
			},
		},
	},
```
