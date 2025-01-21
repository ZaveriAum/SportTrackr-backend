const userController = require('../controllers/userController')

const express = require('express');
const router = express.Router();
const { body } = require('express-validator')
const validator = require('../middlewares/validator')
const authenticateToken = require('../middlewares/jwtAuth')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.use(validator)
router.use(authenticateToken)

router.get('', userController.getUserProfile)

router.put('/update',[
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
],validator, userController.updateUserProfile);

router.put('/update-pass',[
    body('oldPassword')
        .isLength({ min: 8 })
        .withMessage('Old Password must be at least 8 characters long'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New Password must be at least 8 characters long'),
    body('newConfirmPassword')
        .isLength({ min: 8 })
        .withMessage('New Confirm Password must be same as Password'),
],validator, userController.updateUserPassword)

router.post('/upload-photo', upload.single('file'), userController.uploadProfilePhoto)

module.exports = router
