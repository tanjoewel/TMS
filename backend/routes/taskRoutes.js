const express = require("express");
const router = express.Router({ mergeParams: true });

const authenticateToken = require("../middleware/authenticateToken");
const authenticateTask = require("../middleware/authenticateTask");
const taskController = require("../controllers/taskController");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

// crud apis
router.get("/", taskController.getTasksForApp);
router.get("/:taskID", taskController.getTaskByIDRoute);
router.post("/create", taskController.createTask);
router.patch("/update/:taskID", authenticateTask, taskController.updateTask);

router.patch("/addNote/:taskID", authenticateTask, taskController.addNotesRoute);

// state transition apis
router.patch("/release/:taskID", authenticateTask, taskController.releaseTask);
router.patch("/demote/:taskID", authenticateTask, taskController.demoteTask);
router.patch("/work/:taskID", authenticateTask, taskController.workOnTask);
router.patch("/approve/:taskID", authenticateTask, taskController.approveTask);
router.patch("/reject/:taskID", authenticateTask, taskController.rejectTask);
router.patch("/seek/:taskID", authenticateTask, taskController.seekApproval);

module.exports = router;
