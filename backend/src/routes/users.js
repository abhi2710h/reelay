const router = require('express').Router();
const { getProfile, updateProfile, updateSettings, followUser, getUserReels, getSuggestedUsers, handleFollowRequest, getFollowRequests, togglePrivacy, getSavedReels, saveReel, blockUser, getBlockedUsers, getFollowers, removeFollower, getFollowersList } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { imageUpload } = require('../config/storage');

router.get('/suggested', protect, getSuggestedUsers);
router.get('/follow-requests', protect, getFollowRequests);
router.get('/saved-reels', protect, getSavedReels);
router.get('/followers', protect, getFollowers);
router.get('/blocked', protect, getBlockedUsers);
router.put('/profile', protect, (req, res, next) => { req.uploadFolder = 'avatars'; next(); }, imageUpload.single('avatar'), updateProfile);
router.put('/settings', protect, updateSettings);
router.post('/toggle-privacy', protect, togglePrivacy);
router.post('/follow-request/handle', protect, handleFollowRequest);
router.get('/:username', protect, getProfile);
router.get('/:username/connections', protect, getFollowersList);
router.post('/:id/follow', protect, followUser);
router.post('/:id/block', protect, blockUser);
router.post('/:id/remove-follower', protect, removeFollower);
router.post('/:id/save', protect, saveReel);
router.get('/:username/reels', protect, getUserReels);

module.exports = router;
