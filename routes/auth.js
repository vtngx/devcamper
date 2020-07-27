const express = require('express');

const {
    register,
    login,
    getMe,
    forgotPassord,
    resetPassword
} = require('./../controllers/auth');

const {protect} = require('./../middleware/auth');

const router = express.Router();

router.put('/resetpassword/:resettoken', resetPassword);
router.post('/forgotpassword', forgotPassord);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;