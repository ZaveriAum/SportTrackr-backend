const connectAccountController = require('../controllers/connectAccountController');
const express = require("express");
const router = express.Router()
const authenticateToken = require("../middlewares/jwtAuth");

router.use(authenticateToken)

router.get("/dashboard", connectAccountController.getExpressDashboard);
router.post("", connectAccountController.createConnectAccountLink);

module.exports = router;