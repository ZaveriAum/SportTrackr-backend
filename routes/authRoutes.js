const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const validator = require('../middlewares/validator')
const { body } = require('express-validator')

router.use(validator.validate)

router.post('/register',[
    body('first_name')
        .exists().withMessage('First name is required')
        .notEmpty().withMessage('First name is required')
        .isString().withMessage('First name must be a string')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('last_name')
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
    body('confirm_password')
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

router.post('/logout', authController.logout)

module.exports = router;
