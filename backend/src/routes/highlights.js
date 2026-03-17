const router = require('express').Router();
const { getHighlights, createHighlight, addStoryToHighlight, deleteHighlight, removeStoryFromHighlight } = require('../controllers/highlightController');
const { protect } = require('../middleware/auth');

router.get('/user/:userId', protect, getHighlights);
router.post('/', protect, createHighlight);
router.post('/:id/stories', protect, addStoryToHighlight);
router.delete('/:id/stories/:storyId', protect, removeStoryFromHighlight);
router.delete('/:id', protect, deleteHighlight);

module.exports = router;
