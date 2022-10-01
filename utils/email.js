const nodemailer = require('nodemailer');

const sendEmail = async options => {
	// 1.创建传输器
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	// 2.定义邮件的 options
	const mailOptions = {
		from: "Natour website mail <user@gmail.com>",
		to: options.email,
		subject: options.subject,
		text: options.message,
	};
	// 3.发送邮件 (异步函数 如果不想用 Promise就用await)
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
