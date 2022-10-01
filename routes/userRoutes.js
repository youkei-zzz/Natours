const express = require('express');
const {
	signup,
	login,
	forgotPassword,
	resetPassword,
	protect,
	updatePassword,
	deleteMe,
} = require('../controllers/authController.js');
const {
	getAllUser,
	createUser,
	getUser,
	updateUser,
	deleteUser,
	updateMe,
} = require('../controllers/userController.js');
const router = express.Router();

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.post('/signup', signup);
router.post('/login', login);

router.patch('/updateMyPassword', protect, updatePassword);

router.route('/').get(getAllUser).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
