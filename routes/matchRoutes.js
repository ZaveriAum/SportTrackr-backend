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
router.get("/stats",matchController.getStats)
router.post('/highlights', upload.fields([
    { name: 'highlights[0][video]', maxCount: 1 },  
    { name: 'highlights[1][video]', maxCount: 1 },  
    { name: 'highlights[2][video]', maxCount: 1 }   
  ]), matchController.uploadHighlights);
  router.get("/:id",matchController.getMatchDetails)
module.exports = router;
