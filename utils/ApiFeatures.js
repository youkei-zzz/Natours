class APIFeatures {
	// query 表示传入的查询结果文档，queryString表示传入的 query 参数中的 key-value
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}
	// 1.1). Filtering (过滤掉不需要这一步处理的query参数,留给后面的去管,这一步只管将参数中的比较符转换成 MongoDB的比较符)
	filter() {
		const queryObj = { ...this.queryString };
		const excludeFields = ['page', 'sort', 'limit', 'fields'];
		excludeFields.forEach(el => delete queryObj[el]);

		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);

		this.query = this.query.find(JSON.parse(queryStr));

		return this;
	}
	// 1.2). Sorting (实现按条件排序的功能)
	sort() {
		if (this.queryString.sort) {
			// query里面的sort用逗号分割开来，如果要按多条件排序,先去逗号 再转换成以空格隔开的字符串
			// console.log(this.queryString.sort) 参数污染时(例如路径是 xxxx/tours?sort=duration&sort=price  ) queryString  是 [ 'duration', 'price' ]数组  没有split方法,所以会报错 导致程序崩溃
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy); // 指定this.query里面的sort值作为MongoDB的排序依据,类型是string 多个值用空格隔开
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}
	// 1.3).  FeildLimiting (实现字段过滤的功能)
	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			// 不包括 __v字段 因为这是mongodb自己用的
			this.query = this.query.select('-__v');
		}
		return this;
	}
	// 1.4) Pagination (实心分页的功能)
	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skipNum = (page - 1) * limit;
		this.query = this.query.skip(skipNum).limit(limit);

		return this;
	}
}
exports.APIFeatures = APIFeatures;
