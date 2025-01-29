const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const { body } = require('express-validator')
const validator = require('../middlewares/validator')


router.use(validator)

router.post('/register/:token',[
    body('firstName')
        .exists().withMessage('First name is required')
        .notEmpty().withMessage('First name is required')
        .isString().withMessage('First name must be a string')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName')
        .exists().withMessage('Last name is required')
        .notEmpty().withMessage('Last name is required')
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
        .isLength({ min: 8 })
        .withMessage('Confirm Password must be same as Password'),
],validator, authController.register);

router.post('/login',[
    body('email')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
],validator, authController.login);

router.get('/refresh', authController.refresh);

router.post('/verify', authController.verifyEmail)

router.post('/forgot', authController.forgotPassword)

router.post('/reset/:token', authController.resetPassword)

router.post('/logout', authController.logout)

module.exports = router;
