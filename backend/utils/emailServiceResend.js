const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        console.log('=== SENDING EMAIL WITH RESEND ===');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('API Key exists:', !!process.env.RESEND_API_KEY);

        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Small Letters <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html,
            text: text
        });

        console.log('Email sent successfully:', data);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('=== RESEND EMAIL ERROR ===');
        console.error('Message:', error.message);
        console.error('Full error:', error);
        throw error;
    }
};

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
          .header { background: #6893a6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0d4e69; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
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
              <a href="${resetLink}" style="color: #0d4e69; word-break: break-all;">${resetLink}</a>
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
          .header { background: #6893a6; color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #0d4e69; padding: 30px; border-radius: 0 0 10px 10px; }
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