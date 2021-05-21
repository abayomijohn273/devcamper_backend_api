const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env variables
dotenv.config({
    path: "./config/config.env"
});


// Routes files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require("./routes/auth");
const users = require("./routes/users");


// Connect to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File Uploading
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

// since error handler is a middleware, it is declared in the entry file server.js and  placed after the routers is declares
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}! in ${process.env.NODE_ENV} mode`.yellow.bold);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error:${err.message}`.red)
    server.close(() => process.exit(1));
})