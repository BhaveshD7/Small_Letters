const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


class User {
  static async create({ name, email, password, role = 'reader' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async matchPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

// PASSWORD RESET METHODS
// ==========================================

User.createPasswordResetToken = async (email) => {
  try {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate random token (32 bytes = 64 characters in hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before saving to database (for security)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time (1 hour from now)
    const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save hashed token and expire time to database
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3',
      [hashedToken, expireTime, user.id]
    );

    console.log('✅ Reset token created for user:', user.email);

    // Return UNhashed token (this goes in the email link)
    return resetToken;

  } catch (error) {
    console.error('❌ Error in createPasswordResetToken:', error);
    throw error;
  }
};

User.resetPassword = async (token, newPassword) => {
  try {
    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log('Looking for user with token...');

    // Find user with valid token (not expired)
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()',
      [hashedToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const user = result.rows[0];
    console.log('✅ Valid token found for user:', user.email);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token fields
    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    console.log('✅ Password reset successful for:', user.email);

    return user;

  } catch (error) {
    console.error('❌ Error in resetPassword:', error);
    throw error;
  }
};

module.exports = User;
