const express = require('express');
const leagueController = require('../controllers/leagueController');
const router = express.Router();
const validator = require('../middlewares/validator');
const authenticateToken = require('../middlewares/jwtAuth')
const multer = require('multer')
const {check} = require('express-validator');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.use(authenticateToken)

router.get('/', leagueController.getAllLeagues);

router.get("/:id",leagueController.getLeague)
router.post('/', upload.single('file'), [
    check('leagueName')
        .notEmpty().withMessage('League name is required')
        .isString().withMessage('League name must be a string')
        .isLength({ max: 50 }).withMessage('League name cannot exceed 50 characters'),
    check('teamStarterSize')
        .isInt({ min: 1 }).withMessage('Team starter size must be a positive integer'),
    check('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    check('maxTeamSize')
        .isInt({ min: 1 }).withMessage('Max team size must be a positive integer'),
    check('gameAmount')
        .exists().withMessage('Game Amount is required')
        .isInt({ min: 1 }).withMessage('Game amount must be a positive integer'),
    check('startTime')
        .isISO8601().withMessage('Invalid Date Format'),
    check('endTime')
        .isISO8601().withMessage('Invalid Date Format')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
], validator, leagueController.createLeague);

router.put('/:leagueId', [
    check('leagueName')
        .notEmpty().withMessage('League name is required')
        .isString().withMessage('League name must be a string')
        .isLength({ max: 50 }).withMessage('League name cannot exceed 50 characters'),
    check('teamStarterSize')
        .isInt({ min: 1 }).withMessage('Team starter size must be a positive integer'),
    check('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    check('maxTeamSize')
        .isInt({ min: 1 }).withMessage('Max team size must be a positive integer'),
    check('gameAmount')
        .isInt({ min: 1 }).withMessage('Game amount must be a positive integer'),
    check('startTime')
        .isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    check('endTime')
        .isISO8601().withMessage('End time must be a valid ISO 8601 date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
] , validator, leagueController.updateLeague);
router.post('/:leagueId', upload.single('file'), leagueController.uploadLeagueLogo);
router.delete('/:leagueId', leagueController.deleteLeague);

module.exports = router;
