const express = require("express");
const router = express.Router();

// TODO define user controller file
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);

module.exports = router;
