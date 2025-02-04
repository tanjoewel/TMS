const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");
const checkAdmin = require("../middleware/checkAdmin");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

// all user management should only be accessed by an admin, so we have a middleware to check if the logged in user is an admin
router.use(checkAdmin);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
// use put because I intend to send in the whole user object - idempotency
router.put("/", userController.updateUser);

module.exports = router;
