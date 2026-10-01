const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const aiChatContextController = require('../controllers/aiChatContextController');

const router = express.Router();

router.use(requireAuth);
router.get('/recent', aiChatContextController.getLatestConversationContext);
router.post('/ask', aiChatContextController.askWithContext);

module.exports = router;