const pool = require('../config/db');
const Post = require('../models/Post');

// ============================================
// PUBLIC POST ENDPOINTS
// ============================================

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, 
              u.name as author_name, 
              u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.is_published = true
       ORDER BY p.published_at DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM posts WHERE is_published = true'
    );

    const posts = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      body: row.body,
      coverImage: row.cover_image,
      series: row.series,
      seriesPosition: row.series_position,
      postType: row.post_type,
      isPublished: row.is_published,
      isPremium: row.is_premium,
      publishedAt: row.published_at,
      likes: row.likes,
      views: row.views,
      saves: row.saves,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        name: row.author_name,
        avatar: row.author_avatar
      }
    }));

    res.status(200).json({
      success: true,
      posts: posts,
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(countResult.rows[0].count / limit),
      currentPage: page,
      count: posts.length
    });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPopularPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.slug, p.cover_image, p.published_at, p.likes, p.post_type,
              u.name as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.is_published = true
       ORDER BY p.likes DESC
       LIMIT 5`
    );

    const posts = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      slug: row.slug,
      coverImage: row.cover_image,
      publishedAt: row.published_at,
      likes: row.likes,
      postType: row.post_type,
      author: {
        name: row.author_name,
        avatar: row.author_avatar
      }
    }));

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('getPopularPosts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// const getAllSeries = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         series,
//         COUNT(*) as posts_count,
//         MAX(series_position) as total_parts
//       FROM posts 
//       WHERE series IS NOT NULL 
//       GROUP BY series
//       ORDER BY series
//     `);

//     const series = result.rows.map(row => ({
//       slug: row.series,
//       name: formatSeriesName(row.series),
//       postsCount: parseInt(row.posts_count),
//       totalParts: parseInt(row.total_parts) || 5
//     }));

//     res.status(200).json({ success: true, series });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const getAllSeries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        series,
        COUNT(*) as posts_count,
        MAX(series_position) as total_parts
      FROM posts 
      WHERE series IS NOT NULL 
        AND series != ''
        AND is_published = true
      GROUP BY series
      ORDER BY series
    `);

    const series = result.rows.map(row => ({
      seriesSlug: row.series,  // Changed from 'slug' to 'seriesSlug'
      name: formatSeriesName(row.series),
      count: parseInt(row.posts_count),  // Changed from 'postsCount' to 'count'
      totalParts: parseInt(row.total_parts) || 5
    }));

    res.status(200).json({ success: true, series });
  } catch (error) {
    console.error('getAllSeries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const formatSeriesName = (slug) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// const getSeriesPosts = async (req, res) => {
//   try {
//     const posts = await Post.findBySeries(req.params.seriesSlug);
//     if (!posts.length) {
//       return res.status(404).json({ success: false, message: 'Series not found or has no posts yet' });
//     }
//     res.status(200).json({ success: true, count: posts.length, posts });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const getSeriesPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
              u.name as author_name, 
              u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.series = $1 AND p.is_published = true
       ORDER BY p.series_position ASC`,
      [req.params.seriesSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Series not found or has no posts yet'
      });
    }

    const posts = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      body: row.body,
      coverImage: row.cover_image,
      series: row.series,
      seriesPosition: row.series_position,
      postType: row.post_type,
      isPublished: row.is_published,
      isPremium: row.is_premium,
      publishedAt: row.published_at,
      likes: row.likes,
      views: row.views,
      saves: row.saves,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        name: row.author_name,
        avatar: row.author_avatar
      }
    }));

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('getSeriesPosts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.slug = $1 AND p.is_published = true`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const row = result.rows[0];

    await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [row.id]);

    const post = {
      _id: row.id,
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      body: row.body,
      coverImage: row.cover_image,
      series: row.series,
      seriesPosition: row.series_position,
      postType: row.post_type,
      isPublished: row.is_published,
      isPremium: row.is_premium,
      publishedAt: row.published_at,
      likes: row.likes,
      views: row.views + 1,
      saves: row.saves,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        name: row.author_name,
        avatar: row.author_avatar
      }
    };

    let seriesPosts = [];
    if (post.series) {
      const seriesResult = await pool.query(
        `SELECT id, title, slug, series_position, cover_image
         FROM posts
         WHERE series = $1 AND is_published = true
         ORDER BY series_position ASC`,
        [post.series]
      );

      seriesPosts = seriesResult.rows.map(r => ({
        _id: r.id,
        id: r.id,
        title: r.title,
        slug: r.slug,
        seriesPosition: r.series_position,
        coverImage: r.cover_image
      }));
    }

    res.status(200).json({ success: true, post, seriesPosts });
  } catch (error) {
    console.error('getPostBySlug error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ADMIN POST CRUD
// ============================================

// const createPost = async (req, res) => {
//   try {
//     const postData = {
//       ...req.body,
//       author_id: req.user.id,
//       series: req.body.series || null,
//       series_position: req.body.seriesPosition ? parseInt(req.body.seriesPosition) : null,
//       post_type: req.body.postType || 'essay',
//       is_premium: req.body.isPremium || false,
//       is_published: req.body.isPublished || false,
//       cover_image: req.body.coverImage || null,
//       tags: req.body.tags || [],
//     };

//     const post = await Post.create(postData);
//     res.status(201).json({ success: true, post });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const createPost = async (req, res) => {
  try {
    const {
      title, subtitle, body, coverImage, postType,
      series, seriesPosition, isPremium, isPublished,
      tags, seoTitle, seoDescription
    } = req.body;

    // Generate clean slug from title only
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check for duplicate slug
    const existing = await pool.query(
      'SELECT id FROM posts WHERE slug = $1', [slug]
    );

    const finalSlug = existing.rows.length > 0
      ? `${slug}-${Date.now()}`
      : slug;

    const result = await pool.query(`
      INSERT INTO posts (
        title, subtitle, body, cover_image, post_type,
        series, series_position, is_premium, is_published,
        tags, seo_title, seo_description, slug,
        author_id, published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14,
        CASE WHEN $9 THEN CURRENT_TIMESTAMP ELSE NULL END,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `, [
      title,
      subtitle || null,
      body,
      coverImage || null,
      postType || 'essay',
      series || null,
      seriesPosition ? parseInt(seriesPosition) : null,
      isPremium || false,
      isPublished || false,
      tags || [],
      seoTitle || null,
      seoDescription || null,
      finalSlug,
      req.user.id
    ]);

    const row = result.rows[0];

    res.status(201).json({
      success: true,
      post: {
        id: row.id,
        title: row.title,
        slug: row.slug,
        series: row.series,
        seriesPosition: row.series_position,
        isPublished: row.is_published,
      }
    });
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(`
      SELECT 
        p.*,
        u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      title, subtitle, body, coverImage, postType, series, seriesPosition,
      tags, isPremium, isPublished, seoTitle, seoDescription
    } = req.body;

    const userId = req.user.id;

    const existingPost = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [postId]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (existingPost.rows[0].author_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await pool.query(`
      UPDATE posts SET
        title = $1,
        subtitle = $2,
        body = $3,
        cover_image = $4,
        post_type = $5,
        series = $6,
        series_position = $7,
        tags = $8,
        is_premium = $9,
        is_published = $10,
        seo_title = $11,
        seo_description = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [
      title, subtitle, body, coverImage, postType, series, seriesPosition,
      tags, isPremium, isPublished, seoTitle, seoDescription, postId
    ]);

    res.status(200).json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const result = await Post.incrementLikes(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, likes: result.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const savePost = async (req, res) => {
  try {
    const result = await Post.incrementSaves(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, saves: result.saves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ADMIN ANALYTICS
// ============================================

const getAdminStats = async (req, res) => {
  try {
    const totalPosts = await pool.query(
      'SELECT COUNT(*) as total FROM posts WHERE is_published = true'
    );

    const totalDrafts = await pool.query(
      'SELECT COUNT(*) as total FROM posts WHERE is_published = false'
    );

    const totalSubscribers = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE role = $1',
      ['reader']
    );

    const totalEngagement = await pool.query(`
      SELECT 
        SUM(likes) as total_likes,
        SUM(views) as total_views,
        SUM(saves) as total_saves
      FROM posts
    `);

    const postsThisMonth = await pool.query(`
      SELECT COUNT(*) as total 
      FROM posts 
      WHERE published_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND is_published = true
    `);

    const viewsThisMonth = await pool.query(`
      SELECT SUM(views) as total
      FROM posts
      WHERE published_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    res.status(200).json({
      success: true,
      stats: {
        totalPosts: parseInt(totalPosts.rows[0].total),
        totalDrafts: parseInt(totalDrafts.rows[0].total),
        totalSubscribers: parseInt(totalSubscribers.rows[0].total),
        totalLikes: parseInt(totalEngagement.rows[0].total_likes) || 0,
        totalViews: parseInt(totalEngagement.rows[0].total_views) || 0,
        totalSaves: parseInt(totalEngagement.rows[0].total_saves) || 0,
        postsThisMonth: parseInt(postsThisMonth.rows[0].total),
        viewsThisMonth: parseInt(viewsThisMonth.rows[0].total) || 0,
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminPopularPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.cover_image,
        p.published_at,
        p.likes,
        p.views,
        p.saves,
        p.post_type,
        u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_published = true
      ORDER BY p.views DESC, p.likes DESC
      LIMIT $1
    `, [limit]);

    const posts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      coverImage: row.cover_image,
      publishedAt: row.published_at,
      likes: row.likes,
      views: row.views,
      saves: row.saves,
      postType: row.post_type,
      author: row.author_name
    }));

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('getAdminPopularPosts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const recentPosts = await pool.query(`
      SELECT 
        'post_published' as type,
        p.id,
        p.title,
        p.published_at as timestamp,
        u.name as user_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_published = true
      ORDER BY p.published_at DESC
      LIMIT 5
    `);

    const recentSubscribers = await pool.query(`
      SELECT 
        'new_subscriber' as type,
        id,
        name as user_name,
        email,
        created_at as timestamp
      FROM users
      WHERE role = 'reader'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const activities = [
      ...recentPosts.rows.map(row => ({
        type: row.type,
        id: row.id,
        title: row.title,
        userName: row.user_name,
        timestamp: row.timestamp
      })),
      ...recentSubscribers.rows.map(row => ({
        type: row.type,
        id: row.id,
        userName: row.user_name,
        email: row.email,
        timestamp: row.timestamp
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.error('getRecentActivity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getViewsOverTime = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const result = await pool.query(`
      SELECT 
        DATE(published_at) as date,
        COUNT(*) as posts,
        SUM(views) as views
      FROM posts
      WHERE published_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND is_published = true
      GROUP BY DATE(published_at)
      ORDER BY date ASC
    `);

    res.status(200).json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        posts: parseInt(row.posts),
        views: parseInt(row.views) || 0
      }))
    });
  } catch (error) {
    console.error('getViewsOverTime error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPostsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let whereClause = '';
    if (status === 'published') whereClause = 'WHERE p.is_published = true';
    else if (status === 'draft') whereClause = 'WHERE p.is_published = false';

    const result = await pool.query(`
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts p ${whereClause}`
    );

    const posts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      coverImage: row.cover_image,
      postType: row.post_type,
      isPublished: row.is_published,
      isPremium: row.is_premium,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      likes: row.likes,
      views: row.views,
      saves: row.saves,
      tags: row.tags,
      series: row.series,
      seriesPosition: row.series_position,
      author: {
        name: row.author_name,
        avatar: row.author_avatar
      }
    }));

    res.status(200).json({
      success: true,
      posts,
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(countResult.rows[0].count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('getAllPostsAdmin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get featured posts (admin-selected)
const getFeaturedPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const result = await pool.query(
      `SELECT p.*, 
              u.name as author_name, 
              u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.is_published = true AND p.is_featured = true
       ORDER BY p.published_at DESC
       LIMIT $1`,
      [limit]
    );

    const posts = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      body: row.body,
      coverImage: row.cover_image,
      series: row.series,
      seriesPosition: row.series_position,
      postType: row.post_type,
      isPublished: row.is_published,
      isPremium: row.is_premium,
      isFeatured: row.is_featured,
      publishedAt: row.published_at,
      likes: row.likes,
      views: row.views,
      saves: row.saves,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        name: row.author_name,
        avatar: row.author_avatar
      }
    }));

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('getFeaturedPosts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { postId } = req.params;

    // Get current status
    const current = await pool.query(
      'SELECT is_featured FROM posts WHERE id = $1',
      [postId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Toggle
    const newStatus = !current.rows[0].is_featured;

    await pool.query(
      'UPDATE posts SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, postId]
    );

    res.status(200).json({
      success: true,
      isFeatured: newStatus
    });
  } catch (error) {
    console.error('toggleFeatured error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ============================================
// SINGLE EXPORT - THIS IS THE FIX!
// ============================================

module.exports = {
  getPosts,
  getPopularPosts,
  getAllSeries,
  getSeriesPosts,
  getPostBySlug,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  savePost,
  getAdminStats,
  getAdminPopularPosts,
  getRecentActivity,
  getViewsOverTime,
  getAllPostsAdmin,
  getFeaturedPosts,
  toggleFeatured,
};