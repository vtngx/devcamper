const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const User = require('./../models/User');

//Register user - GET /api/v1/auth/register - Public
exports.register = asyncHandler(async function (req, res, next) {
    const {name, email, password, role} = req.body;

    //Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    //Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({success: true, token: token});
});