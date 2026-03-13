const pool = require('../config/db');
const slugify = require('slugify');

const SERIES_LIST = [
  'love-in-small-letters-i',
  'love-in-small-letters-ii',
  'love-in-small-letters-iii',
  'love-in-small-letters-iv',
  'love-in-small-letters-v',
];

class Post {
  static async create(postData) {
    const {
      title, subtitle, body, cover_image, author_id, series, series_position,
      post_type, is_published, is_premium, tags
    } = postData;

    const slug = slugify(title, { lower: true, strict: true });
    const published_at = is_published ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO posts 
       (title, subtitle, slug, body, cover_image, author_id, series, series_position, 
        post_type, is_published, is_premium, published_at, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, subtitle, slug, body, cover_image, author_id, series, series_position,
       post_type, is_published, is_premium, published_at, tags]
    );
    return result.rows[0];
  }

  static async findAll({ page = 1, limit = 10, type, tag }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE is_published = true';
    const params = [];
    let paramCount = 1;

    if (type) {
      whereClause += ` AND post_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    if (tag) {
      whereClause += ` AND $${paramCount} = ANY(tags)`;
      params.push(tag);
      paramCount++;
    }

    const result = await pool.query(
      `SELECT p.*, u.name as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY published_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts ${whereClause}`,
      params
    );

    return {
      posts: result.rows,
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(countResult.rows[0].count / limit),
      currentPage: page,
    };
  }

  static async findBySlug(slug) {
    const result = await pool.query(
      `SELECT p.*, u.name as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.slug = $1 AND p.is_published = true`,
      [slug]
    );

    if (result.rows.length > 0) {
      // Increment views
      await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [result.rows[0].id]);
    }

    return result.rows[0];
  }

  static async findPopular(limit = 5) {
    const result = await pool.query(
      `SELECT p.id, p.title, p.slug, p.cover_image, p.published_at, p.likes, p.post_type,
              u.name as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.is_published = true
       ORDER BY p.likes DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async findBySeries(seriesSlug) {
    const result = await pool.query(
      `SELECT p.*, u.name as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.series = $1 AND p.is_published = true
       ORDER BY p.series_position ASC`,
      [seriesSlug]
    );
    return result.rows;
  }

  static async getAllSeries() {
    const seriesData = [];
    for (const s of SERIES_LIST) {
      const firstPost = await pool.query(
        `SELECT p.title, p.subtitle, p.slug, p.cover_image, p.published_at, p.series, p.series_position,
                u.name as author_name
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.series = $1 AND p.is_published = true AND p.series_position = 1`,
        [s]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM posts WHERE series = $1 AND is_published = true',
        [s]
      );

      seriesData.push({
        seriesSlug: s,
        firstPost: firstPost.rows[0] || null,
        count: parseInt(countResult.rows[0].count),
      });
    }
    return seriesData;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    values.push(id);
    const result = await pool.query(
      `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  }

  static async incrementLikes(id) {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [id]
    );
    return result.rows[0];
  }

  static async incrementSaves(id) {
    const result = await pool.query(
      'UPDATE posts SET saves = saves + 1 WHERE id = $1 RETURNING saves',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Post;
module.exports.SERIES_LIST = SERIES_LIST;
