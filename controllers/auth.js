const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const sendMail = require('../utils/sendEmail');

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res)
})


// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide and email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email: email }).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if passworrd matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res)
})

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name || req.user.name,
        email: req.body.email || req.user.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate,  {
        runValidators: true, 
        new: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Update password
// @route   PUT /api/v1/auth/updatePassword
// @access  Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect', 401))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
})


// @desc   Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse('No user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })
    
    // create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    const message = `You are recieving this email because you (or someone else) has requested the reset of a password, Please make a PUT request to: \n\n ${resetUrl}`;


    try {
        await sendMail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({
            success: true,
            data: "Email sent"
        })
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({
            validateBeforeSave: false
        })

        return next(new ErrorResponse("Email could not be sent", 500));
    }

    res.status(200).json({
        success: true,
        data: user
    })
})


// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // Get hash token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    
    const user = await User.findOne({
        resetPasswordToken, 
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });

    if(!user){
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()

    sendTokenResponse(user, 200, res);
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    //  Creat cookie
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    // change http to https in production
    if(process.env.NODE_ENV === "production"){
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })

}