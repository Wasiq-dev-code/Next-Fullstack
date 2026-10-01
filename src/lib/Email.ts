import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
) {
  console.log('Sending verification email to:', email)
  const result = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verification Code',
    html: `
    <h2>Hello ${username}!
      Your OTP Code</h2>
    <p>${verifyCode}</p>
    <p>This code will expire in 10 minutes.</p>
  `,
  });
  console.log('Resend result:', result);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetUrl: string,
) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Hello ${escapeHtml(username)},</h2>
      <p>We received a request to reset your password.</p>
      <p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>
      <p>This link expires in 30 minutes and can only be used once. If you did not request a reset, you can ignore this email.</p>
    `,
  });
}
