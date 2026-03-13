const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getPostComments,
    addComment,
    deleteComment,
    getUserComments
} = require('../controllers/commentController');

// Post comments
router.get('/post/:postId', getPostComments);
router.post('/post/:postId', protect, addComment);
router.delete('/:commentId', protect, deleteComment);

// User comments
router.get('/user/my-comments', protect, getUserComments);

module.exports = router;