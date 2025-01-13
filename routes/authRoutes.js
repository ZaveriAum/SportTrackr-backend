const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const { body } = require('express-validator')


router.post('/register',[
    body('lastName')
        .exists().withMessage('First name is required')
        .notEmpty().withMessage('First name is required')
        .isString().withMessage('First name must be a string')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName')
        .exists().withMessage('First name is required')
        .notEmpty().withMessage('Last name is required')
        .isString().withMessage('First name must be a string')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    body('email')
        .exists().withMessage('Email is required')
        .notEmpty().withMessage('Email is required')
        .isString().withMessage('Email must be a string')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
        .isLength({ min: 8 })
        .withMessage('Confirm Password must be same as Password'),
], authController.register);

router.post('/login',[
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
], authController.login);

router.get('/refresh', authController.refresh);

router.get('/confirmation/:token', authController.confirmation)

router.post('/logout', authController.logout)

module.exports = router;
