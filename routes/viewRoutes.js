const express = require('express');
const authController = require('../controllers/authController.js');
const viewsContrller = require('../controllers/viewsContrller.js');

const router = express.Router();

// 退出时也会触发这个路由级别的全局中间件 所以 会进入renderLoggedIn 路由 又因为  有catchAsync 所以一会报错 jwt malformed
// router.use(authController.renderLoggedIn);

router.get('/', authController.renderLoggedIn, viewsContrller.getOverview);
router.get('/tour/:slug', authController.renderLoggedIn, viewsContrller.getTour);
router.get('/login', authController.renderLoggedIn, viewsContrller.getLoginForm);
router.get('/me', authController.protect, viewsContrller.getAccount);

module.exports = router;
