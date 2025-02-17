const express = require("express");
const router = express.Router({ mergeParams: true });

const authenticateToken = require("../middleware/authenticateToken");
const taskController = require("../controllers/taskController");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

// crud apis
router.get("/", taskController.getTasksForApp);
router.post("/create", taskController.createTask);
router.patch("/update/:taskID", taskController.updateTask);

router.patch("/addNote/:taskID", taskController.addNotesRoute);

// state transition apis
router.patch("/release/:taskID", taskController.releaseTask);
router.patch("/demote/:taskID", taskController.demoteTask);
router.patch("/work/:taskID", taskController.workOnTask);
router.patch("/approve/:taskID", taskController.approveTask);
router.patch("/reject/:taskID", taskController.rejectTask);

module.exports = router;
