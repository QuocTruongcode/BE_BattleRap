const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const historyChatBotController = require('../controllers/historyChatBotController');

const router = express.Router();

router.use(requireAuth);

router.post('/', historyChatBotController.createHistoryChatBot);
router.get('/conversations/recent', historyChatBotController.getRecentConversationIDs);
router.get('/conversation/:conversationID', historyChatBotController.getHistoryChatBotsByConversation);
router.get('/:id', historyChatBotController.getHistoryChatBotById);
router.put('/:id', historyChatBotController.updateHistoryChatBot);
router.delete('/:id', historyChatBotController.deleteHistoryChatBot);

module.exports = router;