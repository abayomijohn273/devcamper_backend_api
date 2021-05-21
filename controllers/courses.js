const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({
            bootcamp: req.params.bootcampId
        })

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get single course
// @route   GET /api/v1/courses/:courseId
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Add new course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.id}`, 404));
    }

      //Make sure user is bootcamp owner
      if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.user.id} is not authorize to add this course to ${bootcamp.id}`, 401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Update course
// @route   PUT /api/v1/courses/:courseId
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

      //Make sure user is bootcamp owner
      if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.user.id} is not authorize to update this course`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })
})


// @desc    Delete course
// @route   DELETE /api/v1/courses/:courseId
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

      //Make sure user is bootcamp owner
      if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.user.id} is not authorize to remove this course`, 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
})
