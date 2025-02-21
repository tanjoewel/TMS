const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");
const authenticateToken = require("../middleware/authenticateToken");
const checkAdmin = require("../middleware/checkAdmin");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.get("/", groupController.getDistinctGroups);
router.get("/isPM/:username", groupController.isUserPM);
router.get("/canCreate/:username/:acronym", groupController.canCreateTask);
router.post("/checkgroup", groupController.checkGroupRoute);
router.post("/assign", checkAdmin, groupController.assignGroup);
router.post("/create", checkAdmin, groupController.createGroup);

module.exports = router;
