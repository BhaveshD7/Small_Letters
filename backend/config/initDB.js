const pool = require('./db');

const initDB = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'reader' CHECK (role IN ('admin', 'reader')),
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        subtitle TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        body TEXT NOT NULL,
        cover_image TEXT,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        series VARCHAR(50),
        series_position INTEGER CHECK (series_position >= 1 AND series_position <= 5),
        post_type VARCHAR(20) DEFAULT 'essay' CHECK (post_type IN ('quote', 'paragraph', 'phrase', 'essay', 'series')),
        is_published BOOLEAN DEFAULT false,
        is_premium BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Subscribers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
      CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(is_published, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_series ON posts(series, series_position);
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = initDB;
