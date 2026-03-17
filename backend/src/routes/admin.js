const router = require('express').Router();
const { getDashboardStats, getUsers, banUser, getReportedReels, removeReel, makeAdmin } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/admin', makeAdmin);
router.get('/reported-reels', getReportedReels);
router.delete('/reels/:id', removeReel);

module.exports = router;
