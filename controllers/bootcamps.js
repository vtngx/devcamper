const ErrorResponse = require('./../utils/errorResponse');
const Bootcamp = require('./../models/Bootcamp.js');

//Get all bootcamps - GET /api/v1/bootcamps - Public
exports.getBootcamps = async function (req, res, next) {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        });
    } catch (err) {
        next(err);
    }
};

//Get a bootcamp by ID - GET /api/v1/bootcamps/:id - Public
exports.getBootcamp = async function (req, res, next) {
    try {
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
    } catch (err) {
        next(err);
    }
};

//Create a new bootcamp - POST /api/v1/bootcamps - Private
exports.createBootcamp = async function (req, res, next) {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(200).json({
            success: true,
            data: bootcamp
        });
    } catch (err) {
        next(err);
    }
};

//Update a bootcamp - PUT /api/v1/bootcamps/:id - Private
exports.updateBootcamp = async function (req, res, next) {
    try {
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
    } catch (err) {
        next(err);
    }
};

//Delete a bootcamp - DELETE /api/v1/bootcamps/:id - Private
exports.deleteBootcamp = async function (req, res, next) {
    try {
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
    } catch (err) {
        next(err);
    }
};

