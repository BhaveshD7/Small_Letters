const pool = require('../config/db');

// Like a post (toggle)
const toggleLikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if already liked
        const existingLike = await pool.query(
            'SELECT id FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
            [userId, postId, 'like']
        );

        if (existingLike.rows.length > 0) {
            // Unlike
            await pool.query(
                'DELETE FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
                [userId, postId, 'like']
            );
            await pool.query('UPDATE posts SET likes = likes - 1 WHERE id = $1', [postId]);

            const result = await pool.query('SELECT likes FROM posts WHERE id = $1', [postId]);

            return res.status(200).json({
                success: true,
                liked: false,
                likes: result.rows[0].likes
            });
        } else {
            // Like
            await pool.query(
                'INSERT INTO user_interactions (user_id, post_id, interaction_type) VALUES ($1, $2, $3)',
                [userId, postId, 'like']
            );
            await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);

            const result = await pool.query('SELECT likes FROM posts WHERE id = $1', [postId]);

            return res.status(200).json({
                success: true,
                liked: true,
                likes: result.rows[0].likes
            });
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Save a post (toggle)
const toggleSavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if already saved
        const existingSave = await pool.query(
            'SELECT id FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
            [userId, postId, 'save']
        );

        if (existingSave.rows.length > 0) {
            // Unsave
            await pool.query(
                'DELETE FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3',
                [userId, postId, 'save']
            );
            await pool.query('UPDATE posts SET saves = saves - 1 WHERE id = $1', [postId]);

            const result = await pool.query('SELECT saves FROM posts WHERE id = $1', [postId]);

            return res.status(200).json({
                success: true,
                saved: false,
                saves: result.rows[0].saves
            });
        } else {
            // Save
            await pool.query(
                'INSERT INTO user_interactions (user_id, post_id, interaction_type) VALUES ($1, $2, $3)',
                [userId, postId, 'save']
            );
            await pool.query('UPDATE posts SET saves = saves + 1 WHERE id = $1', [postId]);

            const result = await pool.query('SELECT saves FROM posts WHERE id = $1', [postId]);

            return res.status(200).json({
                success: true,
                saved: true,
                saves: result.rows[0].saves
            });
        }
    } catch (error) {
        console.error('Toggle save error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's liked posts
const getUserLikedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM user_interactions ui
      LEFT JOIN posts p ON ui.post_id = p.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE ui.user_id = $1 AND ui.interaction_type = 'like'
      ORDER BY ui.created_at DESC
    `, [userId]);

        const posts = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            subtitle: row.subtitle,
            slug: row.slug,
            coverImage: row.cover_image,
            postType: row.post_type,
            publishedAt: row.published_at,
            likes: row.likes,
            views: row.views,
            saves: row.saves,
            author: {
                name: row.author_name,
                avatar: row.author_avatar
            }
        }));

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Get liked posts error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's saved posts
const getUserSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM user_interactions ui
      LEFT JOIN posts p ON ui.post_id = p.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE ui.user_id = $1 AND ui.interaction_type = 'save'
      ORDER BY ui.created_at DESC
    `, [userId]);

        const posts = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            subtitle: row.subtitle,
            slug: row.slug,
            coverImage: row.cover_image,
            postType: row.post_type,
            publishedAt: row.published_at,
            likes: row.likes,
            views: row.views,
            saves: row.saves,
            author: {
                name: row.author_name,
                avatar: row.author_avatar
            }
        }));

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Get saved posts error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check if user has liked/saved a post
const checkUserInteractions = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT interaction_type FROM user_interactions WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );

        const interactions = {
            liked: false,
            saved: false
        };

        result.rows.forEach(row => {
            if (row.interaction_type === 'like') interactions.liked = true;
            if (row.interaction_type === 'save') interactions.saved = true;
        });

        res.status(200).json({
            success: true,
            ...interactions
        });
    } catch (error) {
        console.error('Check interactions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    toggleLikePost,
    toggleSavePost,
    getUserLikedPosts,
    getUserSavedPosts,
    checkUserInteractions
};