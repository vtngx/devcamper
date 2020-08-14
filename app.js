const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const xssClean = require('xss-clean');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const helmet = require('helmet');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const hpp = require('hpp');

//load env file
dotenv.config({path: './config/config.env'});

//Connect to DB
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('short'));
}

//FIle uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS
app.use(xssClean());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,   //10 min
    max: 100
});

app.use(limiter);

//Prevent HPP
app.use(hpp());

//Enable CORS
app.use(cors());

//Set static folders
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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

