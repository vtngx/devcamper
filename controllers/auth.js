const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const sendEmail = require('./../utils/sendEmail');
const User = require('./../models/User');
const crypto = require('crypto');

//Register user - POST /api/v1/auth/register - Public
exports.register = asyncHandler(async function (req, res, next) {
    const {name, email, password, role} = req.body;

    //Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

//User Login - POST /api/v1/auth/login - Public
exports.login = asyncHandler(async function (req, res, next) {
    const {email, password} = req.body;

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(
            'Please provide an email and password',
            400
        ));
    }

    //Check User
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return next(new ErrorResponse(
            'Invalid credentials',
            401
        ));
    }

    //Match passwords
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse(
            'Invalid credentials',
            401
        ));
    } else {
        sendTokenResponse(user, 200, res);
    }
});

//User Logout - POST /api/v1/auth/logout - Private
exports.logout = asyncHandler(async function (req, res, next) {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

//Get Current Logged in User - GET /api/v1/auth/me - Private
exports.getMe = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id);

    res
        .status(200)
        .json({success: true, data: user});
});

//Forgot password - POST /api/v1/auth/forgotpassword - Private
exports.forgotPassord = asyncHandler(async function (req, res, next) {
    const user = await User.findOne({email : req.body.email});

    if (!user) {
        return next(new ErrorResponse(
            'There is no user with this email',
            404
        ));
    }

    //Get reset token & save token to db
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    //Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/authgit pu/resetpassword/${resetToken}`;
    const message = `You have requested to reset the password. Please mae a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({success: true, data: 'Email sent'});
    } catch (e) {
        console.log(e);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorResponse(
            'Email could not be sent',
            500
        ));
    }
});

//Reset Password - PUT /api/v1/auth/resetpassword/:resettoken - Public
exports.resetPassword = asyncHandler(async function (req, res, next) {
    const newPassword = req.body.password;

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if (!user) {
        return next(new ErrorResponse(
            'Invalid Token',
            400
        ));
    }

    //Set new Password
    user.password = newPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

//Update user details - PUT /api/v1/auth/updatedetails - Private
exports.updateDetails = asyncHandler(async function (req, res, next) {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res
        .status(200)
        .json({success: true, data: user});
});

//Update password - PUT /api/v1/auth/updatepassword - Private
exports.updatePassword = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id).select('+password');

    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
        return next(new ErrorResponse(
            'Password incorrect',
            401
        ));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

//Get token from model - create cookie
const sendTokenResponse = function (user, statusCode, res) {
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({success: true, token: token});
};