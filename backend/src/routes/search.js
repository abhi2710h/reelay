const router = require('express').Router();
const { search, getTrendingHashtags } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.get('/', protect, search);
router.get('/trending-hashtags', protect, getTrendingHashtags);

module.exports = router;
