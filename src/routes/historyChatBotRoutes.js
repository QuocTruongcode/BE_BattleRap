const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const historyChatBotController = require('../controllers/historyChatBotController');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole("U0"), historyChatBotController.createHistoryChatBot);
router.get('/conversations/recent', historyChatBotController.getRecentConversationIDs);
router.get('/conversation/:conversationID', historyChatBotController.getHistoryChatBotsByConversation);
router.get('/:id', historyChatBotController.getHistoryChatBotById);
router.put('/:id', requireRole("U0"), historyChatBotController.updateHistoryChatBot);
router.delete('/:id', requireRole("U0"), historyChatBotController.deleteHistoryChatBot);

module.exports = router;