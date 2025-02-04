const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");
const checkAdmin = require("../middleware/checkAdmin");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.get("/", checkAdmin, userController.getAllUsers);
router.post("/", checkAdmin, userController.createUser);
// use put because I intend to send in the whole user object - idempotency
router.put("/", checkAdmin, userController.updateUser);
// profile specifically does not need the checkAdmin middleware as anybody should be able to update their own profile, regardless of if they are admin or not.
router.put("/profile", userController.updateProfile);

module.exports = router;
