const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate-email", protect, aiController.generateEmail);
router.get("/history", protect, aiController.getHistory);

module.exports = router;