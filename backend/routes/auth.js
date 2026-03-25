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

// TEST EMAIL - Remove after debugging
router.post('/test-email', async (req, res) => {
    try {
        const { sendEmail } = require('../utils/emailService');

        console.log('=== EMAIL CONFIG ===');
        console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET');
        console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

        const result = await sendEmail({
            to: 'whatf.ever0719@gmail.com',
            subject: 'Test Email - Small Letters',
            html: '<h1>Email Works!</h1><p>Your email configuration is correct.</p>',
            text: 'Email works!'
        });

        console.log('Email sent successfully:', result);
        res.json({ success: true, result });
    } catch (error) {
        console.error('=== EMAIL ERROR ===');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Response:', error.response);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
});

module.exports = router;