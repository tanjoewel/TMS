const express = require("express");
const router = express.Router();

const a3controller = require("../controllers/a3controller");

router.post("/CreateTask", a3controller.createTask);
router.post("/GetTaskbyState", a3controller.getTaskbyState);
router.patch("/PromoteTask2Done", a3controller.promoteTask2Done);
// router.get("/*", (req, res) => {
//   res.status(404).send("Invalid URL");
// })

module.exports = router;
