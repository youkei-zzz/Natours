const express = require('express');
const viewsContrller = require('../controllers/viewsContrller.js');

const router = express.Router();

router.get('/', viewsContrller.getOverview);
router.get('/tour/:slug', viewsContrller.getTour);

module.exports = router;
