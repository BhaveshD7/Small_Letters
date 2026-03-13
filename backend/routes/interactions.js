const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    toggleLikePost,
    toggleSavePost,
    getUserLikedPosts,
    getUserSavedPosts,
    checkUserInteractions
} = require('../controllers/userInteractionController');

// Toggle interactions
router.post('/like/:postId', protect, toggleLikePost);
router.post('/save/:postId', protect, toggleSavePost);

// Get user's interactions
router.get('/liked', protect, getUserLikedPosts);
router.get('/saved', protect, getUserSavedPosts);

// Check interactions for a post
router.get('/check/:postId', protect, checkUserInteractions);

module.exports = router;