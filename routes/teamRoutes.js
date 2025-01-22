const express = require('express');
const teamController = require('../controllers/teamController');
const router = express.Router();
const validator = require('../middlewares/validator');
const authenticateToken = require('../middlewares/jwtAuth')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.use(validator)
router.use(authenticateToken)

router.post('/', teamController.createTeam);


module.exports = router;
