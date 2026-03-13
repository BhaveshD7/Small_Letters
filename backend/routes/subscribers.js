const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers, unsubscribe } = require('../controllers/subscriberController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', subscribe);
router.get('/', protect, adminOnly, getSubscribers);
router.delete('/unsubscribe', unsubscribe);

module.exports = router;
