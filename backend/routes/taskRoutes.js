const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const taskController = require("../controllers/taskController");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

// crud apis
router.get("/:acronym", taskController.getTasksForApp);
router.post("/create/:acronym", taskController.createTask);
router.patch("/update/:taskID", taskController.updateTask);

router.patch("/addNote/:taskID", taskController.addNotesRoute);

// state transition apis
router.patch("/release/:taskID", taskController.releaseTask);
router.patch("/demote/:taskID", taskController.demoteTask);

module.exports = router;
