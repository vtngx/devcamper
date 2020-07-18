const ErrorResponse = require('./../utils/errorResponse');
const Bootcamp = require('./../models/Bootcamp.js');
const asyncHandler = require('./../middleware/async');
const geoCoder = require('./../utils/geocoder');
const path = require('path');

//Get all bootcamps - GET /api/v1/bootcamps - Public
exports.getBootcamps = asyncHandler(async function (req, res, next) {
    let query;

    //Make copy of req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select', 'sort', 'limit', 'page', 'skip'];
    removeFields.forEach(function (param) {
        delete reqQuery[param];
    });

    //Create query string
    let queryStr = JSON.stringify(reqQuery);

    //Create operators
    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        match => `$${match}`
    );

    //Find resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    //select
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('phone');
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    const bootcamps = await query;

    //Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination: pagination,
        data: bootcamps
    });
});

//Get a bootcamp by ID - GET /api/v1/bootcamps/:id - Public
exports.getBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');

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
exports.createBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(200).json({
        success: true,
        data: bootcamp
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
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(bootcamp) {
        bootcamp.remove();

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

//Upload photo to a bootcamp - PUT /api/v1/bootcamps/:id/photo - Private
exports.bootcampPhotoUpload = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(bootcamp) {
        if (req.files) {
            const file = req.files.file;

            //Check if the uploaded is a photo
            if (file.mimetype.startsWith('image')) {
                //Check File size
                if (file.size > process.env.MAX_FILE_UPLOAD) {
                    return next(new ErrorResponse(
                        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}` ,
                        400
                    ));
                } else {
                    //Custom filename
                    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

                    //Upload file
                    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async function (err) {
                        if(err) {
                            console.error(err);
                            return next(new ErrorResponse(
                                `Problem with file upload`,
                                500
                            ))
                        }

                        await Bootcamp.findOneAndUpdate(req.params.id, {photo: file.name});

                        res.status(200).json({
                            success: true,
                            data: file.name
                        });
                    });
                }
            } else {
                return next(new ErrorResponse(
                    'Please upload an image',
                    400
                ));
            }
        } else {
            return next(new ErrorResponse(
                'Please upload a file',
                400
            ));
        }
    } else {
        return  next(new ErrorResponse(
            'Bootcamp not found with id of ' + req.params.id,
            404
        ));
    }
});

