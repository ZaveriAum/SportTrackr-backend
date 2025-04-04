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

router.get("/goal-highlight",matchController.getGoalHighlights);
router.get("/save-highlight",matchController.getSaveHighlights);
router.get("/dribble-highlight",matchController.getDribbleHighlights);

router.get("/highlight/:userId",matchController.getHighlightsByUser);
router.get("/:id",matchController.getMatchDetails)
router.get("/league/:leagueId", matchController.getMatchesByLeagueId);
router.get("/team/:teamId", matchController.getMatchesByTeamId);

router.get("/general/:matchId", matchController.getMatchById);
router.put('/:matchId/forfeit', matchController.updateForfeited);
router.post('/createMatches', matchController.createMatch);
router.get('/createMatches/:leagueId', matchController.getDataCreateMatch);
router.delete("/:matchId", matchController.deleteMatch)


module.exports = router;
