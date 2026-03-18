const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0f0f0f;
  color: #ffffff;
  padding: 40px 20px;
`;

const cardStyle = `
  max-width: 480px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 20px;
  padding: 40px;
  border: 1px solid #2a2a2a;
`;

const btnStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #ffffff;
  padding: 14px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  margin: 24px 0;
`;

exports.sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"ReelAY" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your ReelAY account',
    html: `<div style="${baseStyle}">
      <div style="${cardStyle}">
        <div style="text-align:center;margin-bottom:32px">
          <div style="display:inline-flex;width:56px;height:56px;background:linear-gradient(135deg,#a855f7,#ec4899);border-radius:16px;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff">R</div>
          <h1 style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:12px 0 4px">ReelAY</h1>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Verify your email</h2>
        <p style="color:#888;line-height:1.6;margin-bottom:4px">Thanks for signing up! Click the button below to verify your email address and activate your account.</p>
        <div style="text-align:center">
          <a href="${url}" style="${btnStyle}">Verify Email</a>
        </div>
        <p style="color:#555;font-size:13px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        <p style="color:#444;font-size:12px;margin-top:16px;word-break:break-all">Or copy this link: ${url}</p>
      </div>
    </div>`
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"ReelAY" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your ReelAY password',
    html: `<div style="${baseStyle}">
      <div style="${cardStyle}">
        <div style="text-align:center;margin-bottom:32px">
          <div style="display:inline-flex;width:56px;height:56px;background:linear-gradient(135deg,#a855f7,#ec4899);border-radius:16px;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff">R</div>
          <h1 style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:12px 0 4px">ReelAY</h1>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Reset your password</h2>
        <p style="color:#888;line-height:1.6">Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center">
          <a href="${url}" style="${btnStyle}">Reset Password</a>
        </div>
        <p style="color:#555;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#444;font-size:12px;margin-top:16px;word-break:break-all">Or copy this link: ${url}</p>
      </div>
    </div>`
  });
};
