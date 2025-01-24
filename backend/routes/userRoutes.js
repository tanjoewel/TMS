const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");
router.use(authenticateToken);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
// router.post("/login", userController.login);

module.exports = router;
