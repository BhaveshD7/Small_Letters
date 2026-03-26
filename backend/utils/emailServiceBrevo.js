const sendEmail = async ({ to, subject, html, text }) => {
    console.log('=== SENDING EMAIL WITH BREVO ===');
    console.log('To:', to);
    console.log('Subject:', subject);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: 'Small Letters',
                email: process.env.BREVO_SENDER_EMAIL || 'smllletters@gmail.com'
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html,
            textContent: text
        })
    });

    const data = await response.json();
    console.log('Brevo response:', data);

    if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
    }

    return data;
};

const emailTemplates = {
    passwordReset: (resetLink, name) => ({
        subject: 'Reset Your Password - Small Letters',
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
            <h1 style="margin: 0; font-size: 28px;">Small Letters</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi${name ? ' ' + name : ''},</p>
            <p>We received a request to reset your password. Click the button below:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Or copy this link:<br>
              <a href="${resetLink}" style="color: #0d4e69; word-break: break-all;">${resetLink}</a>
            </p>
            <p style="font-size: 14px; color: #666;"><strong>Expires in 1 hour.</strong></p>
            <p style="font-size: 14px; color: #666;">If you didn't request this, ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Small Letters. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Hi${name ? ' ' + name : ''},\n\nReset your password: ${resetLink}\n\nExpires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n- Small Letters Team`
    })
};

module.exports = { sendEmail, emailTemplates };