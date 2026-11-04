const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const aiChatContextController = require('../controllers/aiChatContextController');

const router = express.Router();

router.use(requireAuth);
router.get('/recent', aiChatContextController.getLatestConversationContext);
router.post('/ask', requireRole("U0"), aiChatContextController.askWithContext);

module.exports = router;