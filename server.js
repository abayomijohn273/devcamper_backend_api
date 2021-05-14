const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env variables
dotenv.config({
    path: "./config/config.env"
});


// Routes files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');


// Connect to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

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