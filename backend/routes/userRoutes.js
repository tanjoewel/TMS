const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");
const checkAdmin = require("../middleware/checkAdmin");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);
// middleware to check admin.
router.use(checkAdmin);

router.get("/", userController.getAllUsers);
router.post("/create", userController.createUser);
// use put because I intend to send in the whole user object - idempotency
router.put("/update", userController.updateUser);
router.delete("/", userController.deleteUser);

module.exports = router;
