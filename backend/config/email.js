const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    throw error;
  }
};

// ── Welcome email — Small Letters branded ─────────────
const sendWelcomeEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: 'you found your way here 🤍 — small letters',
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;
                  padding: 48px 32px; color: #1a1a1a; background: #fdfcfb;">

        <p style="font-family: 'Courier New', monospace; font-size: 11px;
                  letter-spacing: 3px; color: #aaa; text-transform: uppercase;
                  margin-bottom: 36px;">small letters</p>

        <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 20px;
                   line-height: 1.3;">
          welcome. you're in. 🤍
        </h2>

        <p style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 18px;">
          thank you for subscribing to <strong>small letters</strong> — 
          a quiet corner of the internet where love gets to be 
          spoken in full sentences.
        </p>

        <p style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 18px;">
          here you'll find love phrases, quotes that feel like they were 
          written for you, and the <em>Love in Small Letters</em> series — 
          five chapters, twenty-five pieces, one feeling at a time.
        </p>

        <p style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 36px;">
          every new piece will find its way to you. no noise, no rush.
          just words.
        </p>

        <p style="font-size: 16px; font-style: italic; color: #888; margin-bottom: 4px;">
          with love,
        </p>
        <p style="font-size: 17px; font-weight: 700; margin-bottom: 0;">
          small letters
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 24px;" />

        <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
          you subscribed at smallletters.in · 
          <a href="#" style="color: #bbb;">unsubscribe</a> any time.
        </p>
      </div>
    `,
  });
};

// ── New post notification email ───────────────────────
const sendNewPostEmail = async (subscribers, post) => {
  const emailList = subscribers.map(s => s.email);
  await sendEmail({
    to: emailList.join(','),
    subject: `new: "${post.title}" — small letters`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;
                  padding: 48px 32px; color: #1a1a1a; background: #fdfcfb;">

        <p style="font-family: 'Courier New', monospace; font-size: 11px;
                  letter-spacing: 3px; color: #aaa; text-transform: uppercase;
                  margin-bottom: 36px;">small letters · new post</p>

        <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 12px;
                   line-height: 1.3;">${post.title}</h2>

        ${post.subtitle
          ? `<p style="font-size: 17px; color: #888; margin-bottom: 28px;
                       font-style: italic;">${post.subtitle}</p>`
          : ''}

        <p style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 32px;">
          ${post.body.replace(/<[^>]*>/g, '').substring(0, 280)}…
        </p>

        <a href="${process.env.CLIENT_URL}/post/${post.slug}"
           style="display: inline-block; background: #1a1a1a; color: white;
                  text-decoration: none; padding: 12px 26px; border-radius: 4px;
                  font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
          read it →
        </a>

        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 24px;" />

        <p style="font-size: 11px; color: #bbb;">
          <a href="${process.env.CLIENT_URL}" style="color: #bbb;">smallletters.in</a> · 
          <a href="#" style="color: #bbb;">unsubscribe</a>
        </p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendNewPostEmail };
