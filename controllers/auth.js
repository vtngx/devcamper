const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const User = require('./../models/User');

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

//Get Current Logged in User - GET /api/v1/auth/me - Private
exports.getMe = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id);

    res
        .status(200)
        .json({success: true, data: user});
});