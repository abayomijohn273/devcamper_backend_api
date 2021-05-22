const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
// Security advance
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
var xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');

// Cors
var cors = require('cors')

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
const reviews = require("./routes/reviews");


// Connect to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File Uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Prevent HTTP param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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