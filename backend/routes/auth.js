// const express = require('express');
// const router = express.Router();
// const { register, login, getMe } = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);

// module.exports = router;

const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// TEST EMAIL - at the BOTTOM of the file
router.post('/test-email', async (req, res) => {
    try {
        const { sendEmail } = require('../utils/emailServiceResend');

        console.log('=== TEST EMAIL ENDPOINT HIT ===');
        console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

        const result = await sendEmail({
            to: 'whatf.ever0719@gmail.com',
            subject: 'Test Email - Small Letters',
            html: '<h1>Email Works!</h1>',
            text: 'Email works!'
        });

        console.log('Email sent:', result);
        res.json({ success: true, result });
    } catch (error) {
        console.error('TEST EMAIL ERROR:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
});
// SIMPLE TEST - No email, just check if route works
router.get('/ping', (req, res) => {
    console.log('PING endpoint hit');
    res.json({
        success: true,
        message: 'Pong!',
        env: {
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasFrontendUrl: !!process.env.FRONTEND_URL,
            nodeEnv: process.env.NODE_ENV
        }
    });
});
module.exports = router;