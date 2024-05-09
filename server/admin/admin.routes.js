const express = require('express');
const { adminDashboard, addItem} = require('./admin.controller');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/dashboard',authenticate, adminDashboard);
router.post('/add-item',authenticate,addItem)

module.exports = router;