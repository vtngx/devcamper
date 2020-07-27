const express = require('express');

const {
    register,
    login,
    getMe,
    forgotPassord,
    resetPassword,
    updateDetails,
    updatePassword
} = require('./../controllers/auth');

const {protect} = require('./../middleware/auth');

const router = express.Router();

router.put('/updatepassword', protect, updatePassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/forgotpassword', forgotPassord);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;