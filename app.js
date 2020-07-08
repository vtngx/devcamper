const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');

//route files
const bootcamps = require('./routes/bootcamps');

//load env file
dotenv.config({path: './config/config.env'});

const app = express();

//Dev logging middleware
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

//mount routers
app.use('/api/v1/bootcamps', bootcamps);

//listen
const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log('Server online in ' + process.env.NODE_ENV + ' mode on port ' + PORT)
);