const express = require('express');
const { adminDashboard, addItem,getOrders,updateItem,editCategories,updateStatus,handleDispute} = require('./admin.controller');
const {authenticate,verifyRoles} = require('../middleware/authenticate');
const router = express.Router();

router.get('/dashboard',authenticate, verifyRoles('Admin'), adminDashboard);
router.post('/add-item',authenticate,verifyRoles('Admin'), addItem)
router.get('/orders',authenticate,verifyRoles('Admin'),getOrders)
router.put('/updateItem',authenticate,verifyRoles('Admin'), updateItem)
router.post('/updatestatus', authenticate, verifyRoles('Admin'),updateStatus)
router.post('/handledispute', authenticate,verifyRoles('Admin'),handleDispute)
router.post('/editcategories', authenticate,verifyRoles('Admin'),editCategories)

module.exports = router;