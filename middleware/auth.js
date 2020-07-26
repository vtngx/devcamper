const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('./../utils/errorResponse');
const User = require('./../models/User');

//Protect routes
exports.protect = asyncHandler(async function (req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    if (!token) {
        return next(new ErrorResponse(
            'Not authorize to access this route',
            401
        ));
    }

    try {
        //Verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        //Get current logged in user by decoded ID
        req.user = await User.findById(decode.id);

        next();
    } catch(e) {
        return next(new ErrorResponse(
            'Not authorize to access this route',
            401
        ));
    }
});

//Grant access to ROLES
exports.authorize = (...roles) => {
    return function (req, res, next) {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(
                `User role ${req.user.role} is not authorized to access this route`,
                403
            ));
        }
        next()
    }
};