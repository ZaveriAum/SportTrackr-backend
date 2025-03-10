const transactionController = require('../controllers/transactionsController');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/jwtAuth')


router.use(authenticateToken)

router.get('/', transactionController.getTransactionsForLeagueOwner)

module.exports = router;