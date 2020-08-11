const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const Review = require('./../models/Review.js');
const Bootcamp = require('./../models/Bootcamp.js');

//Get all reviews
// GET /api/v1/reviews
// GET /api/v1/bootcamps/:bootcampId/reviews
// Public
exports.getReviews = asyncHandler(async function (req, res, next) {
    if(req.params.bootcampId) {
        const reviews = await Review.find({bootcamp: req.params.bootcampId});

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

//Get a course by ID - GET /api/v1/courses/:id - Public
exports.getReview = asyncHandler(async function (req, res, next) {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (review) {
        res.status(200).json({
            success: true,
            data: review
        });
    } else {
        next(new ErrorResponse(
            `Cannot find review with id of ${req.params.id}`,
            404
        ));
    }
});

//Create a new course - POST /api/v1/bootcamp/:bootcampId/reviews - Private
exports.addReview = asyncHandler(async function (req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (bootcamp) {
        const review = await Review.create(req.body);

        res.status(200).json({
            success: true,
            data: review
        })
    } else {
        next(new ErrorResponse(
            `Bootcamp not found with id of ${req.params.bootcampId}`,
            404
        ));
    }
});

//Update a course - PUT /api/v1/reviews/:id - Private
exports.editReview = asyncHandler(async function (req, res, next) {
    let review = await Review.findById(req.params.id);

    if(review) {
        //Check ownership
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(
                `User ${req.user.name} is not authorized to edit this review`,
                401
            ));
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        });
    } else {
        next(new ErrorResponse(
            `Review not found with id of ${req.params.id}`,
            401
        ));
    }
});

//Delete a course - DELETE /api/v1/reviews/:id - Private
exports.deleteReview = asyncHandler(async function (req, res, next) {
    let review = await Review.findById(req.params.id);

    if (review) {
        //Check ownership
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(
                `User ${req.user.name} is not authorized to delete this review`,
                401
            ));
        }

        await review.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } else {
        next(new ErrorResponse(
            `Review not found with id of ${req.params.id}`,
            404
        ));
    }
});