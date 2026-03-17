const router = require('express').Router();
const { getConversations, getOrCreateConversation, getMessages, sendMessage, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId/open', protect, getOrCreateConversation);
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId', protect, sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;
