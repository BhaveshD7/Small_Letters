const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage (no local files)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// Upload image to Cloudinary
router.post('/image', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'small-letters/posts', // Organized in folders
            resource_type: 'auto',
            transformation: [
                { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
                { quality: 'auto:good' }, // Auto optimize
                { fetch_format: 'auto' } // Auto format (WebP if supported)
            ]
        });

        console.log('✅ Image uploaded to Cloudinary:', result.secure_url);

        res.status(200).json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
        });
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Image upload failed',
            error: error.message
        });
    }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', protect, adminOnly, async (req, res) => {
    try {
        // Public ID comes URL encoded, decode it
        const publicId = decodeURIComponent(req.params.publicId);

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            console.log('✅ Image deleted from Cloudinary:', publicId);
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found or already deleted'
            });
        }
    } catch (error) {
        console.error('❌ Cloudinary delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
});

// Get all uploaded images (optional - for media library)
router.get('/images', protect, adminOnly, async (req, res) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'small-letters/posts',
            max_results: 50,
        });

        res.status(200).json({
            success: true,
            images: result.resources.map(img => ({
                url: img.secure_url,
                publicId: img.public_id,
                width: img.width,
                height: img.height,
                format: img.format,
                size: img.bytes,
                createdAt: img.created_at,
            }))
        });
    } catch (error) {
        console.error('❌ Cloudinary list error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch images'
        });
    }
});

module.exports = router;