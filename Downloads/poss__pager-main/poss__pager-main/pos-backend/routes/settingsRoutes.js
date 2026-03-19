const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET current settings
router.get('/', settingsController.getSettings);

// ✅ PUT (Update) settings
router.put('/', settingsController.updateSettings);

module.exports = router;