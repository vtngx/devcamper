const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const Course = require('./../models/Course');

//Get all courses
// GET /api/v1/courses
// GET /api/v1/bootcamps/:bootcampId/courses
// Public
exports.getCourses = asyncHandler(async function (req, res, next) {
    let query;

    if(req.params.bootcampId) {
        query = Course.find({bootcamp: req.params.bootcampId});
    } else {
        query = Course.find();
    }

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

//Get a course by ID - GET /api/v1/bootcamps/:bootcampId - Public
exports.getCourse = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(bootcamp) {
        res.status(200).json({
            success: true,
            data: bootcamp
        });
    } else {
        next(new ErrorResponse(
            'Bootcamp not found with id of ' + req.params.id,
            404
        ));
    }
});

//Create a new bootcamp - POST /api/v1/bootcamps - Private
exports.createCourse = asyncHandler(async function (req, res, next) {
    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

//Update a bootcamp - PUT /api/v1/bootcamps/:id - Private
exports.updateBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(bootcamp) {
        res.status(200).json({
            success: true,
            data: bootcamp
        });
    } else {
        next(new ErrorResponse(
            'Bootcamp not found with id of ' + req.params.id,
            404
        ));
    }
});

//Delete a bootcamp - DELETE /api/v1/bootcamps/:id - Private
exports.deleteBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if(bootcamp) {
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

//Get bootcamps within a radius - GET /api/v1/bootcamps/radius/:zipcode/:distance/ - Private
exports.getBootcampsInRadius = asyncHandler(async function (req, res, next) {
    const { zipcode,distance } = req.params;

    //Get lattitude/longitude from geocoder
    const location = await geoCoder.geocode(zipcode);
    const lat = location[0].latitude;
    const lng = location[0].longitude;

    //Calc radius using radians
    //Divide distance by radius of Earth
    //Earth Radius = 6378km
    const radius = distance / 6378;
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[ lng, lat ], radius ]}}
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

