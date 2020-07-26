const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const Course = require('./../models/Course');
const Bootcamp = require('./../models/Bootcamp');

//Get all courses
// GET /api/v1/courses
// GET /api/v1/bootcamps/:bootcampId/courses
// Public
exports.getCourses = asyncHandler(async function (req, res, next) {
    if(req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId});

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

//Get a course by ID - GET /api/v1/courses/:id - Public
exports.getCourse = asyncHandler(async function (req, res, next) {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(course) {
        res.status(200).json({
            success: true,
            data: course
        });
    } else {
        next(new ErrorResponse(
            'Course not found with id of ' + req.params.id,
            404
        ));
    }
});

//Create a new course - POST /api/v1/bootcamp/:bootcampId/courses - Private
exports.createCourse = asyncHandler(async function (req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    //Check bootcamp existence
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(bootcamp) {
        //Check ownership
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(
                `User ${req.user.name} is not authorized to add a course to bootcamp ${bootcamp._id}`,
                401
            ));
        }

        const course = await Course.create(req.body);

        res.status(200).json({
            success: true,
            data: course
        });
    } else {
        next(new ErrorResponse(
            'Bootcamp not found with id of ' + req.params.id,
            404
        ));
    }
});

//Update a course - PUT /api/v1/courses/:id - Private
exports.updateCourse = asyncHandler(async function (req, res, next) {
    let course = await Course.findById(req.params.id);

    if(course) {
        //Check ownership
        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(
                `User ${req.user.name} is not authorized to update this course`,
                401
            ));
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: course
        });
    } else {
        next(new ErrorResponse(
            'Course not found with id of ' + req.params.id,
            404
        ));
    }
});

//Delete a course - DELETE /api/v1/courses/:id - Private
exports.deleteCourse = asyncHandler(async function (req, res, next) {
    let course = await Course.findById(req.params.id);

    if(course) {
        //Check ownership
        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(
                `User ${req.user.name} is not authorized to delete this course`,
                401
            ));
        }

        await course.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } else {
        next(new ErrorResponse(
            'Bootcamp not found with id of ' + req.params.id,
            404
        ));
    }
});