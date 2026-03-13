const jwt = require('jsonwebtoken');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user.id);

    // Send welcome email (don't fail registration if email fails)
    try {
      const emailContent = emailTemplates.welcome(name);
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    console.log('🔵 Step 1: Forgot password requested for:', email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Step 2: Invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    console.log('✅ Step 2: Email format valid');

    // Check if user exists
    console.log('🔵 Step 3: Looking up user in database...');
    const user = await User.findByEmail(email);
    console.log('✅ Step 4: User lookup result:', user ? `Found: ${user.name}` : 'Not found');

    if (!user) {
      console.log('⚠️ User not found, sending generic success message');
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    // Generate reset token
    console.log('🔵 Step 5: Generating reset token...');
    const resetToken = await User.createPasswordResetToken(email);
    console.log('✅ Step 6: Token generated:', resetToken.substring(0, 15) + '...');

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log('🔵 Step 7: Reset URL created:', resetUrl);

    // Send email
    console.log('🔵 Step 8: Preparing to send email...');
    const emailContent = emailTemplates.passwordReset(resetUrl, user.name);

    console.log('🔵 Step 9: Calling sendEmail function...');
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    console.log('✅ Step 10: Email sent successfully!');

    res.status(200).json({
      success: true,
      message: 'Password reset email sent!'
    });

  } catch (error) {
    console.error('❌❌❌ FORGOT PASSWORD ERROR ❌❌❌');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email. Please try again.'
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
      });
    }

    // Reset password
    await User.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid or expired reset token'
    });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };