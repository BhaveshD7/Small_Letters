const { v2: cloudinary } = require('cloudinary');

// Get all uploaded images
const getAllImages = async (req, res) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'small-letters/posts',
            max_results: 100,
            context: true,
        });

        const images = result.resources.map(img => ({
            publicId: img.public_id,
            url: img.secure_url,
            width: img.width,
            height: img.height,
            format: img.format,
            size: img.bytes,
            createdAt: img.created_at,
        }));

        res.status(200).json({
            success: true,
            images,
            total: result.resources.length,
        });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch images'
        });
    }
};

// Delete image
const deleteImage = async (req, res) => {
    try {
        const publicId = decodeURIComponent(req.params.publicId);

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image'
        });
    }
};

// Get storage stats
const getStorageStats = async (req, res) => {
    try {
        const result = await cloudinary.api.usage();

        res.status(200).json({
            success: true,
            stats: {
                used: result.storage.usage,
                limit: result.storage.limit,
                percentage: ((result.storage.usage / result.storage.limit) * 100).toFixed(2),
            }
        });
    } catch (error) {
        console.error('Storage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch storage stats'
        });
    }
};

module.exports = {
    getAllImages,
    deleteImage,
    getStorageStats,
};