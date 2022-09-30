const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
		// 字段永远不会出现在输出中
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password!'],
		// 不能使用 ()=> 因为 this 无法指向 创建的文档
		// 这个只在执行 Save 操作时有效！！！！！
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'Password are not the same!',
		},
	},
	passwordChangedAt: Date,
});

// 使用中间件加密密码
userSchema.pre('save', async function (next) {
	// 密码没有改变 则不需要处理 仅当密码已被修改（或为新密码）时才对密码进行哈希处理
	if (!this.isModified('password')) return next();

	// 加密密码
	this.password = await bcrypt.hash(this.password, 12);
	//passwordConfirm仅仅是用于确认密码的。 保存了密码过后 这个passwordConfirm 对我们来说就不重要了 也不想保存在数据库中 所以 设置为undefined ，数据库就不会再有这个字段了
	this.passwordConfirm = undefined;
	next();
});

// methods用于此架构上当前定义的方法的对象(每个文档都能调用)

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

const User = mongoose.model('User', userSchema);
module.exports = User;
