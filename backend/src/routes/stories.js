const router = require('express').Router();
const { createStory, getFollowingStories, viewStory, deleteStory, getMyStories } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { storyUpload } = require('../config/storage');

router.post('/', protect, storyUpload.single('media'), createStory);
router.get('/', protect, getFollowingStories);
router.get('/mine', protect, getMyStories);
router.post('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
