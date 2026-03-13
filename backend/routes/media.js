const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllImages, deleteImage, getStorageStats } = require('../controllers/mediaController');

router.get('/images', protect, adminOnly, getAllImages);
router.delete('/images/:publicId', protect, adminOnly, deleteImage);
router.get('/storage', protect, adminOnly, getStorageStats);

module.exports = router;