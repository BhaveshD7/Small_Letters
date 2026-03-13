const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
    // For Gmail (Development/Testing)
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
            },
        });
    }

    // For SendGrid (Production)
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    }

    // Default fallback
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Small Letter'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

// Email Templates
const emailTemplates = {
    passwordReset: (resetLink, name) => ({
        subject: 'Reset Your Password - Small Letter',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Small Letter</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi${name ? ' ' + name : ''},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>This link will expire in 1 hour.</strong>
            </p>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Small Letter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hi${name ? ' ' + name : ''},

We received a request to reset your password for Small Letter.

Click this link to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

- Small Letter Team
    `,
    }),

    welcome: (name) => ({
        subject: 'Welcome to Small Letter! 🎉',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">Welcome to Small Letter!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}! 👋</h2>
            <p>Thank you for subscribing to Small Letter! We're excited to have you as part of our community.</p>
            <p>You'll receive thoughtful letters, insights, and stories directly in your inbox.</p>
            <p style="margin-top: 30px;">Stay tuned for our next edition!</p>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Have questions? Just reply to this email - we'd love to hear from you.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Small Letter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hi ${name}!

Welcome to Small Letter! Thank you for subscribing.

You'll receive thoughtful letters, insights, and stories directly in your inbox.

Stay tuned for our next edition!

- Small Letter Team
    `,
    }),
};

module.exports = { sendEmail, emailTemplates };