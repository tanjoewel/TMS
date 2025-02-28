const express = require("express");
const router = express.Router();

const a3controller = require("../controllers/a3controller");

router.post("/CreateTask", a3controller.createTask);
router.post("/GetTaskbyState", a3controller.getTaskbyState);
router.patch("/PromoteTask2Done", a3controller.promoteTask2Done);
router.all("/*", (req, res) => {
  res.status(400).json({ code: "E1001" });
});

module.exports = router;
