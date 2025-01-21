const express = require('express');
const leagueController = require('../controllers/leagueController');
const router = express.Router();
const validator = require('../middlewares/validator');
const authenticateToken = require('../middlewares/jwtAuth')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.use(validator)
router.use(authenticateToken)

router.get('/', leagueController.getAllLeagues);
router.post('/', upload.single('file'), leagueController.createLeague)

module.exports = router;
