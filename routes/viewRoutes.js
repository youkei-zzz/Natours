const express = require('express');
const authController = require('../controllers/authController.js');
const viewsContrller = require('../controllers/viewsContrller.js');

const router = express.Router();

router.use(authController.renderLoggedIn)

router.get('/', viewsContrller.getOverview);
router.get('/tour/:slug',authController.protect, viewsContrller.getTour);
router.get('/login', viewsContrller.getLoginForm);

module.exports = router;
