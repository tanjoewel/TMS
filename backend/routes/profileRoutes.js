const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const authenticateToken = require("../middleware/authenticateToken");
const checkAdmin = require("../middleware/checkAdmin");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.put("/", profileController.updateProfile);
router.get("/", profileController.getProfile);

module.exports = router;
