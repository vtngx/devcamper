const ErrorResponse = require('./../utils/errorResponse');

const errorHandler = function (err, req, res, next) {
    let error = {...err};

    error.message = err.message;

    //log to console for dev
    console.log(err.name, err.code, err.value);
    // console.log(err.stack.red);

    //Mongoose bad ObjectId
    if(err.name === 'CastError') {
        const message = 'Resource not found with id of ' + err.value;
        error = new ErrorResponse(message, 404);
    }

    //Mongoose duplicated key
    if (err.code === 11000) {
        const message = 'Duplicated field value entered';
        error = new ErrorResponse(message, 400);
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    //Send response
    res.status(error.statusCode || 500).json({
        success: false,
        errorName: err.name,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;