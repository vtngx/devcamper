const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const User = require('./../models/User.js');

//Get all bootcamps - GET /api/v1/bootcamps - Public
exports.getUsers = asyncHandler(async function (req, res, next) {
    res.status(200).json(res.advancedResults);
});
