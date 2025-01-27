const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
// router.post("/login", userController.login);

module.exports = router;
