const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendPasswordResetEmail,resetPassword,confirmPassword } = require('./auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpass', sendPasswordResetEmail);
router.get('/reset-password', resetPassword);
router.post('/reset-password', confirmPassword);
router.get('/',(req,res)=>{
    res.send('Hello')
})
module.exports = router;