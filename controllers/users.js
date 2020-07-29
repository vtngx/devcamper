const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const User = require('./../models/User.js');

//Get all users - GET /api/v1/auth/users - Private/Admin
exports.getUsers = asyncHandler(async function (req, res, next) {
    res.status(200).json(res.advancedResults);
});

//Get single user - GET /api/v1/auth/users/:id - Private/Admin
exports.getUser = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

//Create user - POST /api/v1/auth/users - Private/Admin
exports.createUser = asyncHandler(async function (req, res, next) {
    const user = await User.create(req.body);

    res.status(200).json({
        success: true,
        data: user
    });
});

//Update user - PUT /api/v1/auth/users/:id - Private/Admin
exports.updateUser = asyncHandler(async function (req, res, next) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//Delete user - DELETE /api/v1/auth/users/:id - Private/Admin
exports.deleteUser = asyncHandler(async function (req, res, next) {
    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});