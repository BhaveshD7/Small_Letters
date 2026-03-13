const pool = require('../config/db');

class Subscriber {
  static async create({ email, user_id = null }) {
    const result = await pool.query(
      'INSERT INTO subscribers (email, user_id) VALUES ($1, $2) RETURNING *',
      [email, user_id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM subscribers WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM subscribers WHERE is_active = true ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async unsubscribe(email) {
    await pool.query('UPDATE subscribers SET is_active = false WHERE email = $1', [email]);
  }

  static async delete(email) {
    await pool.query('DELETE FROM subscribers WHERE email = $1', [email]);
  }
}

module.exports = Subscriber;
