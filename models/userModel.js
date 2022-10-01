const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
	name: { type: String, required: [true, 'Please tell us your name!'] },
	email: {
		type: String,
		required: [true, 'A user must have a email!'],
		unique: true,
		lowercase: true,
		validate: {
			validator: validator.isEmail,
		},
	},
	photo: { type: String, require: [true, 'A user at least have one photo! '] },
	role: { type: String, enum: ['user', 'guide', 'lead-guide', 'admin'], default: 'user' },
	password: {
		type: String,
		required: [true, 'A user must have a password!'],
		minlength: 8,
		// 字段永远不会出现在输出中， 后面可在查询的时候用select("+字段名") 输出
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password!'],
		// 不能使用 ()=> 因为 this 无法指向 创建的文档
		// 这个只在执行 save 或者是 create 操作时有效！！！！！
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'Password are not the same!',
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select:false
	},
});

// 使用中间件:

// 改密码时 加密密码
userSchema.pre('save', async function (next) {
	// 密码没有改变 则不需要处理 仅当密码已被修改（或为新密码）时才对密码进行哈希处理
	if (!this.isModified('password')) return next();

	// 加密密码
	this.password = await bcrypt.hash(this.password, 12);
	//passwordConfirm仅仅是用于确认密码的。 保存了密码过后 这个passwordConfirm 对我们来说就不重要了 也不想保存在数据库中 所以 设置为undefined ，数据库就不会再有这个字段了
	this.passwordConfirm = undefined;
	next();
});
// 改密码时 设置 passwordChangedAt 字段
userSchema.pre('save', function (next) {
	// 如果是新创建的文档 或者是密码没有改变 就不需要设置字段 passwordChangedAfter了
	if (!this.isModified('password') || this.isNew) return next();

	// 有个问题 有时候 这里获取的时间会比 token签发的时间迟 导致了好像是用户改了密码一样的错误从而使用户不能登录  这里为了避免这种情况 就 减去1秒(1000ms) 消除一下BUG
	this.passwordChangedAt = Date.now() - 1000;
	next();
});
// 每次自动查询的时候 都查询那些没有被标记为已删除的用户
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});


// methods 用于此架构上当前定义的方法的对象: (每个文档都能调用 所以要用 普通函数而不用箭头函数)

// 检验用户输入的密码
userSchema.methods.correctPassword = async function (cadidatePassWord, userPassword) {
	return await bcrypt.compare(cadidatePassWord, userPassword);
};
// 检查是否改密码
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	// this指向此时的文档，改密码时会给文档对象的 passwordChangedAt 赋一个值 。 JWTTimestamp是调用函数时传入的token颁发时间
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		// console.log(changedTimestamp, JWTTimestamp);
		// 在颁发令牌后改密码了
		return JWTTimestamp < changedTimestamp;
	}
	// false 表示没有改变密码
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	// resetToken 得出随机的一个字符串  createHash指出要用什么加密算法  update 的参数是需要加密的数据。 update() 可以多次被调用，多次调用只是简单的把要加密的结果拼接起来。digest指明用什么形式输出这个字符串
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	// 设置文档token的过期时间的字段(单位 ms) 过了这个时间就不允许进入注册  这里设置 10分钟
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	// console.log(resetToken)
	// console.log(this.passwordResetToken); // 数据库里面储存的token
	return resetToken; //  用户拿到的token
};

const User = mongoose.model('User', userSchema);
module.exports = User;
