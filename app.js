const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');

//load env file
dotenv.config({path: './config/config.env'});

//Connect to DB
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');

const app = express();

//Body parser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('short'));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);

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