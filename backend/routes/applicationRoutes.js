const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const applicationController = require("../controllers/applicationController");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.post("/create", applicationController.createApplication);
router.get("/all", applicationController.getAllApplications);

module.exports = router;
