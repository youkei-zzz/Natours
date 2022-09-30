// const { userRouter, getAllUser, createUser, getUser, updateUser, deleteUser } = require("./app");
const express = require('express');
const { signup, login } = require('../controllers/authController.js');
const {
	getAllUser,
	createUser,
	getUser,
	updateUser,
	deleteUser,
} = require('../controllers/userController.js');
const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)

router.route('/').get(getAllUser).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
