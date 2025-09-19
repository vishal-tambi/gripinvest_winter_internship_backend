// Simple Email Service - Basic functionality
const nodemailer = require('nodemailer');

// Simple email sending (console log if no email config)
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    if (!process.env.EMAIL_HOST) {
      console.log(`Password reset email would be sent to: ${email}`);
      console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
      return Promise.resolve();
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${firstName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};