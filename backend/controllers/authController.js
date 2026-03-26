const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
// const { sendEmail, emailTemplates } = require('../utils/emailService');
// const { sendEmail, emailTemplates } = require('../utils/emailServiceResend');
const { sendEmail, emailTemplates } = require('../utils/emailServiceBrevo');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password with 8 rounds (faster than 10)
    const hashedPassword = await bcrypt.hash(password, 8);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, 'reader']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.'
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Token expires in 1 hour
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // Save to database
    await pool.query(
      `UPDATE users 
       SET reset_password_token = $1, 
           reset_password_expires = $2 
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Get email template
    const { subject, html, text } = emailTemplates.passwordReset(resetUrl, user.name);

    // Send email ASYNC (don't wait for it)
    sendEmail({
      to: user.email,
      subject,
      html,
      text
    }).catch(err => {
      console.error('Email send failed:', err);
      // Don't block the response if email fails
    });

    // Respond immediately (don't wait for email)
    res.json({
      success: true,
      message: 'Password reset email sent. Check your inbox.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email. Please try again.'
    });
  }
};

// const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!password || password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters'
//       });
//     }

//     // Hash the token from URL
//     const resetTokenHash = crypto
//       .createHash('sha256')
//       .update(token)
//       .digest('hex');

//     // Find user with valid token
//     const result = await pool.query(
//       `SELECT * FROM users 
//        WHERE reset_password_token = $1 
//        AND reset_password_expires > $2`,
//       [resetTokenHash, new Date()]
//     );

//     if (result.rows.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or expired reset token'
//       });
//     }

//     const user = result.rows[0];

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(password, 8);

//     // Update password and clear reset token
//     await pool.query(
//       `UPDATE users 
//        SET password = $1,
//            reset_password_token = NULL,
//            reset_password_expires = NULL
//        WHERE id = $2`,
//       [hashedPassword, user.id]
//     );

//     res.json({
//       success: true,
//       message: 'Password reset successful. You can now sign in.'
//     });

//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error resetting password'
//     });
//   }
// };

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the token from URL
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > $2`,
      [resetTokenHash, new Date()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = result.rows[0];

    // Hash new password with 8 rounds (faster)
    const hashedPassword = await bcrypt.hash(password, 8);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successful. You can now sign in.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };