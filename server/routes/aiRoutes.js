const express = require('express')
const router = express.Router();
const aiController = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware')

router.post('/generate-email', protect, aiController.generateEmail);

module.exports = router;