### **Mongoing 文档**

## 🌟①. [官方文档](https://mongoosejs.com/docs/)

## ✨②. [官方文档](https://mongodb.net.cn/manual/crud/)

### `0. 永远不要用 update 的方法更新密码相关的东西`

> **[绕过中间件的情况](https://mongoosejs.com/docs/middleware.html)**

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

> ## 👉 **[CSDN](https://blog.csdn.net/interestANd/article/details/119058481)**

### `6. $project`

```javascript
将仅包含指定字段的文档传递到管道中的下一阶段。指定的字段可以是输入文档中的现有字段，也可以是新计算的字段

语法	                描述
<字段> : <1 或真>	指定包含字段。
_id : <0 或假>	    指定_id字段的抑制。
<字段>:<表达式>	    添加新字段或重置现有字段的值。
```

### `7. MongoDB中间件 | isModified() 函数`

> ### 👉 **[Mongoose 官方文档](https://mongoosejs.com/docs/middleware.html)**
>
> ### 👉 **[CSDN](https://blog.csdn.net/caseywei/article/details/109524964)**

```javascript
// 1. 只能用 function  2. doc指向正在保存的文档内容 ，在.create()和.save()方法之前会被调用
tourSchema.post("save", function (doc,next) {
	console.log(doc); // 输出执行post的文档信息
	if(!this.isModified('')){
		// .....
		// isModified() : 如果文档被改了返回true 否则为false
		//  isModified('xxx') 如果给出指定的字段 则会检查给定字段的或者是包含这个字段的全路径是否被改变 改变了返回true 否则返回false
	}
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

### `9. Error.captureStack() 大概意思`

> ## 👉 **[CSDN](https://zwkkkk1.blog.csdn.net/article/details/83316772?spm=1001.2101.3001.6650.2&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-2-83316772-blog-120124102.t0_edu_mix&utm_relevant_index=3)**

<br>

### `10. 关于异步的封装(避免写很多重复的try...catch)`

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

### `11. 关于MongoDB 中的validate（验证器）何时生效`

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

### `12. Node内置的 promisify`

```javascript
// 导入方法
const { promisify } = require('util');
// Node.js 内置的 util 模块有一个 promisify() 方法，该方法将基于回调的函数转换为基于 Promise 的函数。这使您可以将 Promise 链和 async/await 与基于回调的 API 结合使用。

// 例如 :
const fs = require('fs')
const util = require('util')
​
// 将 fs.readFile() 转换为一个接受相同参数但返回 Promise 的函数。
const readFile = util.promisify(fs.readFile)
​
// 现在可以将 readFile() 与 await 一起使用！
const buf = await readFile('./package.json')
​
const obj = JSON.parse(buf.toString('utf8'))
console.log(obj.name) // 'Example'
```

### `12. crypto 的大概用法`

> ## 👉 **[crypto(简书) ](https://www.jianshu.com/p/f94a6c8cafaa)**
>
> **注意：还有一个第三方包 bcrypt**

```javascript
const resetToken = crypto.randomBytes(32).toString('hex');
// resetToken 得出随机的一个字符串  createHash指出要用什么加密算法  update 的参数是需要加密的数据。 update() 可以多次被调用，多次调用只是简单的把要加密的结果拼接起来。digest指明用什么形式输出这个字符串
this.passwordResetTOKEN = crypto.createHash('sha256').update(resetToken).digest('hex');
```

### `13. res.cookie(name, value, [options])`

```javascript
// Expires – 过期时间。指定cookie的生命期。具体是值是过期日期。如果想让cookie的存在期限超过当前浏览器会话时间，就必须使用这个属性。当过了到期日期时，浏览器就可以删除cookie文件，没有任何影响。

// Path – 路径。指定与cookie关联的WEB页。值可以是一个目录，或者是一个路径。如果/head/index.html 建立了一个cookie，那么在/head/目录里的所有页面，以及该目录下面任何子目录里的页面都可以访问这个cookie。这就是说，在/head/stories/articles 里的任何页面都可以访问/head/index.html建立的cookie。但是，如果/zdnn/ 需要访问/head/index.html设置的cookes，该怎么办?这时，我们要把cookies的path属性设置成“/”。在指定路径的时候，凡是来自同一服务器，URL里有相同路径的所有WEB页面都可以共享cookies。现在看另一个例子：如果想让 /head/filters/ 和/head/stories/共享cookies，就要把path设成“/head”。

// Domain – 域。指定关联的WEB服务器或域。值是域名，比如goaler.com。这是对path路径属性的一个延伸。如果我们想让dev.mycompany.com 能够访问bbs.mycompany.com设置的cookies，该怎么办? 我们可以把domain属性设置成“mycompany.com”，并把path属性设置成“/”。FYI：不能把cookies域属性设置成与设置它的服务器的所在域不同的值。

// Secure – 安全。指定cookie的值通过网络如何在用户和WEB服务器之间传递。这个属性的值或者是“secure”，或者为空。缺省情况下，该属性为空，也就是使用不安全的HTTP连接传递数据。如果一个 cookie 标记为secure，那么，它与WEB服务器之间就通过HTTPS或者其它安全协议传递数据。不过，设置了secure属性不代表其他人不能看到你机器本地保存的cookie。换句话说，把cookie设置为secure，只保证cookie与WEB服务器之间的数据传输过程加密，而保存在本地的cookie文件并不加密。如果想让本地cookie也加密，得自己加密数据。
```

<br>

> 设置 cookie name 值为 value, 接受字符串参数或者 JSON 对象。 path 属性默认为 "/".

```javascript
res.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true });

res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
```

---

> maxAge 属性是一个便利的设置"expires",它是一个从当前时间算起的毫秒。 下面的代码和上一个例子中的第二行是同样的作用。

```javascript
res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true });
```

---

> 可以传一个序列化的 JSON 对象作为参数， 它会自动被 bodyParser() 中间件解析。

```javascript
res.cookie('cart', { items: [1, 2, 3] });
res.cookie('cart', { items: [1, 2, 3] }, { maxAge: 900000 });
```

---

> 这个方法也支持签名的 cookies。 只需要简单的传递 signed 参数。 res.cookie() 会使用通过 express.cookieParser(secret) 传 入的 secret 来签名这个值

```javascript
res.cookie('name', 'tobi', { signed: true });
```

> 稍后你就可以通过 req.signedCookie 对象访问到这个值。

### `14. MongoDB 数据库模型关系`

> ### 👉 **[官方文档](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/)**

### `15. 索引可以加快搜索速度`

```javascript
db.collection.createIndex({ 'a.loc': 1, 'a.qty': 1 }, { unique: true }); // MongoDB 将对索引键值的组合强制实施唯一性。
// 因此我们可以利用这一特性对 每个用户限制只能评论一次
```

> 👉 **[CSDN(操作)](https://blog.csdn.net/qq_46049600/article/details/108178757)**
> 👉 **[Compound Index](https://www.mongodb.com/docs/v6.0/core/index-unique/)**

---

### `16. Aggregate ` [聚合管道](https://mongoing.com/docs/reference/operator/aggregation.html)

```javascript
1.$group:	// 按指定的标识符表达式对输入文档进行分组，并将累加器表达式（如果指定）应用于每个组。使用所有输入文档，并为每个不同的组输出一个文档。输出文档仅包含标识符字段和累积字段（如果已指定）。按某个指定的表达式对文档进行分组，并将每个不同分组的文档输出到下一阶段。输出文档包含一个_id字段，该字段包含按键的不同组。输出文档还可以包含计算字段，这些字段保存按$group_id字段分组的某个累加器表达式的值。$group不对其输出文档进行排序。
```

> 👉 **[$group](https://mongoing.com/docs/reference/operator/aggregation/group.html#pipe._S_group)**

```javascript
2.$set: // 运算符将字段的值替换为指定的值。
```

> 👉 **[$set](https://www.mongodb.com/docs/v6.0/reference/operator/update/set/)**

```javascript
3.$geoNear://按距指定点最近到最远的顺序输出文档。
```

> 👉 **[$geoNear](https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/)**

```javascript
4.$geoWithin: //选择具有完全存在于指定形状内的地理空间数据的文档。
	可用的形状运算符有：
	$box
	$polygon
	$center //（定义一个圆）
	$centerSphere //（在球体上定义一个圆）。为地理空间使用球面几何的查询。该查询返回圆圈范围内的文档。

// 如果您使用经度和纬度，请按 的顺序指定坐标longitude, latitude。


{
   <location field>: {
      $geoWithin: { $centerSphere: [ [ <x>, <y> ], <radius> ] }
   }
}

例如:
db.places.find( {
  loc: { $geoWithin: { $centerSphere: [ [ -88, 30 ], 10/3963.2 ] } }
} )

```

> 👉 **[$geoWithin](https://www.mongodb.com/docs/manual/reference/operator/query/geoWithin/#mongodb-query-op.-geoWithin)**

> 👉 **[运算符 : $centerSphere](https://www.mongodb.com/docs/manual/reference/operator/query/centerSphere/)**

### `17. 路径`

```javascript
// 在图片和css文件加载的时候路径很容易出错 从而导致 加载失败
src="/xxxx/xxx" 和 src="xxxx/xxx  并不一样。
// 有斜线的从根路径开始
// 没有斜线的的是从 当前网站的路径 开始找css文件 或者是图片
```

### `18. 虚拟填充`

**`Query.populate(path, [select], [model], [match], [options])`**

```javascript

select:从 populate 的文档中选择返回的字段
path:指定要查询的表
fields:填充的内容
Model: 可选，指定关联字段的 model，如果没有指定就会使用Schema的ref
Object:可选，指定附加的其他查询选项，如排序以及条数限制等等。

// 请记住，默认情况下，虚拟虚拟不包括在输出中。如果您希望在使用 Express 的 res.json（） 函数 或 等函数时显示填充虚拟虚拟，请在架构和选项上设置该选项。toJSON()toObject

const authorSchema = new Schema({ 字段... }, {
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});


```
> 👉 **[填充](https://mongoosejs.com/docs/populate.html)**

## `19. Npm 安装命令`
```console
npm install moduleName 
npm install --global moduleName 
npm install --save moduleName
npm install --save-dev moduleName
```
> [npm](https://baijiahao.baidu.com/s?id=1637471064122396966)
