const express = require('express');
const matchController = require('../controllers/matchController');
const router = express.Router();
const validator = require('../middlewares/validator');
const authenticateToken = require('../middlewares/jwtAuth')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.use(validator)
router.use(authenticateToken)

router.post('/',matchController.updateMatch);
router.get("/",matchController.getStats)
module.exports = router;
