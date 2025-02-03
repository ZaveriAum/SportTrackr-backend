const express = require('express');
const employeeController = require('../controllers/employeeController')
const router = express.Router();
const { body } = require('express-validator');
const validator = require('../middlewares/validator');
const authenticateToken = require('../middlewares/jwtAuth')


router.use(validator)
router.use(authenticateToken)


router.get('/dashboard',employeeController.getAdminDashboardStats)

router.get('/:leagueId', employeeController.getLeagues);

router.post('/:leagueId', employeeController.assignEmployeeToLeague)



module.exports = router;
