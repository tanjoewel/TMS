const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");
const authenticateToken = require("../middleware/authenticateToken");

router.use(authenticateToken);

router.get("/", groupController.getGroups);
router.post("/", groupController.assignGroup);
router.post("/checkgroup", groupController.checkGroupRoute);

module.exports = router;
