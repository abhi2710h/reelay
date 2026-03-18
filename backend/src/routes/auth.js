const router = require('express').Router();
const { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe, verifyEmail, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);

module.exports = router;
