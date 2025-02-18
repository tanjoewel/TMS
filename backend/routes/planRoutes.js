const express = require("express");
const router = express.Router({ mergeParams: true });

const authenticateToken = require("../middleware/authenticateToken");
const planController = require("../controllers/planController");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.post("/create", planController.createPlan);
router.get("/", planController.getPlansForApp);

module.exports = router;
