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

router.post('/',upload.single("logo") ,teamController.createTeam);
router.patch('/:id',upload.single("logo") ,teamController.updateTeam);
router.get("/",teamController.getTeamByLeagueOwner)
router.get("/players/:teamId",teamController.getTeamPlayers)
router.get("/league/:id",teamController.getTeamsByLeagueId)
router.get("/:id",teamController.getTeamById)
router.delete("/", teamController.deleteTeam)
module.exports = router;
