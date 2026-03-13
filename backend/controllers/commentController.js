const pool = require('../config/db');

// Get all comments for a post
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const result = await pool.query(`
      SELECT 
        c.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
    `, [postId]);

        const comments = result.rows.map(row => ({
            id: row.id,
            postId: row.post_id,
            commentText: row.comment_text,
            createdAt: row.created_at,
            user: {
                id: row.user_id,
                name: row.user_name,
                avatar: row.user_avatar
            }
        }));

        res.status(200).json({
            success: true,
            comments,
            count: comments.length
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a comment
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentText } = req.body;
        const userId = req.user.id;

        console.log('Add comment request:', { postId, userId, commentText });

        if (!commentText || commentText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        // Check if post exists
        const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const result = await pool.query(`
      INSERT INTO comments (post_id, user_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [postId, userId, commentText.trim()]);

        console.log('Comment created:', result.rows[0]);

        // Get user info
        const userResult = await pool.query(
            'SELECT name, avatar FROM users WHERE id = $1',
            [userId]
        );

        const comment = {
            id: result.rows[0].id,
            postId: result.rows[0].post_id,
            commentText: result.rows[0].comment_text,
            createdAt: result.rows[0].created_at,
            user: {
                id: userId,
                name: userResult.rows[0].name,
                avatar: userResult.rows[0].avatar
            }
        };

        res.status(201).json({
            success: true,
            comment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Check if comment belongs to user
        const checkResult = await pool.query(
            'SELECT user_id FROM comments WHERE id = $1',
            [commentId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (checkResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

        res.status(200).json({
            success: true,
            message: 'Comment deleted'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's comments
const getUserComments = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT 
        c.*,
        p.title as post_title,
        p.slug as post_slug
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [userId]);

        const comments = result.rows.map(row => ({
            id: row.id,
            commentText: row.comment_text,
            createdAt: row.created_at,
            post: {
                id: row.post_id,
                title: row.post_title,
                slug: row.post_slug
            }
        }));

        res.status(200).json({
            success: true,
            comments
        });
    } catch (error) {
        console.error('Get user comments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPostComments,
    addComment,
    deleteComment,
    getUserComments
};