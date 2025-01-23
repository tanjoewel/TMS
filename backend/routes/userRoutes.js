const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
// not the final controller function to call
router.post("/login", userController.login);

module.exports = router;
