const express = require('express');
const authController = require('../controllers/authController.js');
const userController = require('../controllers/userController.js');

const router = express.Router();

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

/* -> */ router.use(authController.protect); // 因为是按顺序执行中间件 使用从这个中间件以下的部分全部都要 检验用户时是否登录

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe', authController.deleteMe);
router.patch('/updateMyPassword', authController.updatePassword);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUser).post(userController.createUser);
router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
