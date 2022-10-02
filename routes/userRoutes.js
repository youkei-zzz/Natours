const express = require('express');
const authController = require('../controllers/authController.js');
const userController = require('../controllers/userController.js');

const router = express.Router();

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, authController.deleteMe);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.route('/').get(userController.getAllUser).post(userController.createUser);
router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
