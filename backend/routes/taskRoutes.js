const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const taskController = require("../controllers/taskController");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.post("/create", taskController.createTask);
router.get("/:acronym", taskController.getTasksForApp);

module.exports = router;
