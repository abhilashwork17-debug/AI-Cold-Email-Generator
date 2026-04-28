const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const {
  protect,
  optionalAuth
} = require("../middleware/authMiddleware");


router.post(
  "/generate-email",
  optionalAuth,
  aiController.generateEmail
);


router.get(
  "/history",
  protect,
  aiController.getHistory
);

module.exports = router;