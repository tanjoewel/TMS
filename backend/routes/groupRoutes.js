const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");

router.get("/", groupController.getGroups);
router.post("/", groupController.assignGroup);
// what about adding a user to a group?

module.exports = router;
