const router = require('express').Router();
const { getFeed, getTrending } = require('../controllers/feedController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFeed);
router.get('/trending', protect, getTrending);

module.exports = router;
