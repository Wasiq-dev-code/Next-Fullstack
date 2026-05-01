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
  // console.log('Resend result:', result);
}
