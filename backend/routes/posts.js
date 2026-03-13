const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPopularPosts,
  getAllSeries,
  getSeriesPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  likePost,
  savePost,
  getAdminStats,
  getAdminPopularPosts,
  getRecentActivity,
  getViewsOverTime,
  getAllPostsAdmin,
  getPostById,
  getFeaturedPosts,
  toggleFeatured,
} = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ============================================
// ADMIN ROUTES - MUST COME FIRST (specific paths)
// ============================================

// Admin analytics
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/admin/popular', protect, adminOnly, getAdminPopularPosts);
router.get('/admin/activity', protect, adminOnly, getRecentActivity);
router.get('/admin/views-over-time', protect, adminOnly, getViewsOverTime);
router.get('/admin/all-posts', protect, adminOnly, getAllPostsAdmin);

// Admin CRUD
router.post('/', protect, adminOnly, createPost);
router.get('/id/:postId', protect, getPostById); // Get post by ID for editing
router.put('/:postId', protect, updatePost); // Update post
router.delete('/:id', protect, adminOnly, deletePost);
router.post('/:postId/toggle-featured', protect, adminOnly, toggleFeatured);
// ============================================
// PUBLIC ROUTES - COME AFTER ADMIN ROUTES
// ============================================

// Public post queries
router.get('/', getPosts); // Get all published posts
router.get('/popular', getPopularPosts); // Get popular posts
router.get('/featured', getFeaturedPosts);
// Series routes
router.get('/series', getAllSeries); // Get all series
router.get('/series/:seriesSlug', getSeriesPosts); // Get posts in a series

// Engagement (public)
router.post('/:id/like', likePost);
router.post('/:id/save', savePost);

// ============================================
// DYNAMIC ROUTE - MUST BE LAST
// ============================================

// Get single post by slug - MUST BE LAST to avoid catching other routes
router.get('/:slug', getPostBySlug);

module.exports = router;