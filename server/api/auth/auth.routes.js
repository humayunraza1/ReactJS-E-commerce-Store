const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendPasswordResetEmail,resetPassword,confirmPassword,handleRefreshToken,googleLogin, handleLogout} = require('./auth.controller');
const { authenticate } = require('../../middleware/authenticate');

    router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpass', sendPasswordResetEmail);
router.get('/reset-password', resetPassword);
router.post('/reset-password', confirmPassword);
router.get('/refresh', handleRefreshToken)
router.get('/authenticate', authenticate)
router.get('/logout',handleLogout)
router.post('/google', googleLogin);

router.get('/',(req,res)=>{
    res.send('Hello')
})
module.exports = router;