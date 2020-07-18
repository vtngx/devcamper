const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const connectDB = require('./config/db');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');

//load env file
dotenv.config({path: './config/config.env'});

//Connect to DB
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

//Body parser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('short'));
}

//FIle uploading
app.use(fileupload());

//Set static folders
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

//listen
const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT,
    console.log('Server online in ' + process.env.NODE_ENV.blue + ' mode on port ' + PORT.yellow.bold)
);

//handle unhandled promise rejections
process.on('unhandledRejection', function (err, promise) {
    console.log('Error: ' + err.message.red);
    //Close server
    server.close(function () {
        process.exit(1);
    });
});