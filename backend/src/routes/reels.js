const router = require('express').Router();
const { uploadReel, getReel, likeReel, viewReel, shareReel, deleteReel, addComment, getComments, reportReel, saveReel } = require('../controllers/reelController');
const { protect } = require('../middleware/auth');
const { videoUpload } = require('../config/storage');

router.post('/', protect, videoUpload.single('video'), uploadReel);
router.get('/:id', protect, getReel);
router.delete('/:id', protect, deleteReel);
router.post('/:id/like', protect, likeReel);
router.post('/:id/view', protect, viewReel);
router.post('/:id/share', protect, shareReel);
router.post('/:id/save', protect, saveReel);
router.post('/:id/report', protect, reportReel);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
