const express = require('express');
const router = express.Router();
const { clearIndex } = require('../controllers/systemController');

// DELETE /api/system/clear
// Destructive action to clear the entire index.
router.delete('/clear', clearIndex);

module.exports = router;
