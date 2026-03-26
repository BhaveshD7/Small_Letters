const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  console.log('=== SENDING EMAIL WITH NODEMAILER ===');
  console.log('To:', to);
  console.log('Subject:', subject);

  const mailOptions = {
    from: `"Small Letters" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return info;
};

const emailTemplates = {
  passwordReset: (resetUrl, name) => ({
    subject: 'Reset Your Password - Small Letters',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}\n\nExpires in 1 hour.`
  })
};

module.exports = { sendEmail, emailTemplates };