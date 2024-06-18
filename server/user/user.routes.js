const express = require('express');
const { displayUserDetails,addItemToCart,openDispute, addWishlist,getWishlist,updateProfile,placeOrder,getOrderHistory,cancelOrder,getCart,deleteItemFromCartBySKU} = require('./user.controller');
const {authenticate} = require('../middleware/authenticate');
const router = express.Router();

router.get('/dashboard',authenticate, displayUserDetails);
router.post('/addtocart',authenticate, addItemToCart);
router.post('/placeorder',authenticate, placeOrder);
router.get('/getcart',authenticate, getCart);
router.post('/deleteitem',authenticate, deleteItemFromCartBySKU);
router.post('/cancelorder',authenticate, cancelOrder);
router.post('/updateuser',authenticate, updateProfile);
router.get('/orderhistory',authenticate, getOrderHistory);
router.post('/opendispute',authenticate, openDispute);
router.post('/addwishlist',authenticate, addWishlist);
router.get('/getwishlist',authenticate, getWishlist);



module.exports = router;