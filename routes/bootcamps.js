const express = require('express')

const {
    getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp, 
    getBootcampInRadius, 
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Includes other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp)

router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

module.exports = router;