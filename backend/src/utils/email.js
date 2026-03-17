const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'ReelAY - Reset Your Password',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6366f1">ReelAY</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a>
      <p style="color:#888;margin-top:20px">If you didn't request this, ignore this email.</p>
    </div>`
  });
};

module.exports = { sendPasswordResetEmail };
