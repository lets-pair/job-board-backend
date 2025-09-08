import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../config/logger';
import moment from 'moment';

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: any[]
) => {
  const msg = { from: config.email.from, to, subject, text, html, attachments };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${config.frontend_url}/reset-password?token=${token}`;
  const text = `Dear user,

We received a request to reset your password. Click the link below to set a new password:

Reset Password: ${resetPasswordUrl}

This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.

--
Let's Pair
320 Granville St #1340, Vancouver, BC, V6C 1S9
Phone: (778) 889-7247 | Email: info@letspair.ca`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }
    .icon {
      text-align: center;
      padding: 30px 0 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
      border-radius: 5px;
      text-decoration: none;
      margin: 15px 0;
    }
    .footer {
      font-size: 14px;
      color: #777777;
      text-align: center;
      padding: 20px;
      background-color: #f4f4f4;
    }
  </style>
</head>
<body>
  <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <!-- Icon Header (Now using PNG) -->
    <tr>
      <td class="icon">
        <!-- Base64-encoded PNG lock icon (1x1 transparent pixel as fallback) -->
        <img src="https://cdn-icons-png.flaticon.com/512/3064/3064155.png" width="64" height="64" alt="Lock Icon" style="display: block; margin: 0 auto;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 0 20px 20px; text-align: center;">
        <h1 style="font-size: 24px; color: #333333; margin-bottom: 20px;">Password Reset Request</h1>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetPasswordUrl}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">This link will expire in 24 hours. If you didn't request this change, please ignore this email.</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td class="footer" style="font-size: 14px; color: #777777; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <p style="margin: 5px 0;">Let's Pair</p>
        <p style="margin: 5px 0;">320 Granville St #1340, Vancouver, BC, V6C 1S9</p>
        <p style="margin: 5px 0;">Phone: (778) 889-7247 | Email: info@letspair.ca</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  await sendEmail(to, subject, text, html);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${config.frontend_url}/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}`;
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Let's Pair!</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        font-size: 16px;
        color: #ffffff;
        background-color: #007bff;
        border-radius: 5px;
        text-decoration: none;
      }
      .footer p {
        font-size: 14px;
        color: #777777;
        margin: 5px 0;
      }
      .social-media a {
        margin: 0 5px;
        text-decoration: none;
      }
      .social-media img {
        width: 24px;
        height: 24px;
      }
    </style>
  </head>
  <body>
    <table
      class="email-container"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      bgcolor="#ffffff"
    >
      <!-- Main Content -->
      <tr>
        <td style="padding: 20px; text-align: center">
          <h1 style="font-size: 24px; color: #333333">
            Welcome to Let's Pair!
          </h1>
          <p style="font-size: 16px; color: #555555; line-height: 1.5">
            Thank you for signing up! We're thrilled to have you as part of our
            community. Here's what you can do next:
          </p>

          <!-- Call to Action -->
          <a
            href="${verificationEmailUrl}"
            class="button"
            style="
              display: inline-block;
              margin: 20px 0;
              padding: 12px 24px;
              font-size: 16px;
              color: #ffffff;
              background-color: #007bff;
              border-radius: 5px;
              text-decoration: none;
            "
            >Verify Email Now</a
          >

          <p style="font-size: 16px; color: #555555; line-height: 1.5">
            If you have any questions or need assistance, feel free to reach out
            to us. We're here to help!
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td
          style="background-color: #f4f4f4; padding: 20px; text-align: center"
        >
          <img
            src="https://letspair.s3.us-west-2.amazonaws.com/Trademark.png"
            alt="Company Logo"
            style="max-width: 100px; height: auto; margin-bottom: 10px"
          />
          <p style="font-size: 14px; color: #777777; margin: 5px 0">
            320 Granville St #1340, Vancouver, BC, V6C 1S9
          </p>
          <p style="font-size: 14px; color: #777777; margin: 5px 0">
            Phone: (778) 889-7247 | Email: info@letspair.ca
          </p>
          <div class="social-media">
            <a href="https://www.facebook.com/letspair.ca/"
              ><img
                src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png"
                alt="Facebook"
                style="width: 24px; height: 24px"
            /></a>
            <a href="https://x.com/Lets_Pair_1"
              ><img
                src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png"
                alt="Twitter"
                style="width: 24px; height: 24px"
            /></a>
            <a href="https://www.instagram.com/letspair.ca/"
              ><img
                src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png"
                alt="Instagram"
                style="width: 24px; height: 24px"
            /></a>
            <a href="https://ca.linkedin.com/company/letspairedu"
              ><img
                src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png"
                alt="LinkedIn"
                style="width: 24px; height: 24px"
            /></a>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  await sendEmail(to, subject, text, html);
};

const contactForm = async (name: string, email: string, message: string) => {
  const to = config.email.from;
  const subject = 'New Contact Form Submission';
  const text = `New Contact Form Submission
--------------------------

Name:  ${name}
Email:  ${email}
Message:
${message}

--------------------------
This email was sent from your website's contact form. 
Do not reply directly to this email.
`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
    .details {
      margin: 15px 0;
    }
    .details div {
      margin-bottom: 10px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Contact Form Submission</h1>
  </div>
  <div class="content">
    <div class="details">
      <div>
        <span class="label">Name:</span>
        <span>${name}</span>
      </div>
      <div>
        <span class="label">Email:</span>
        <span>${email}</span>
      </div>
      <div>
        <span class="label">Message:</span>
        <p>${message}</p>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>This email was sent from your website's contact form. Do not reply directly to this email.</p>
  </div>
</body>
</html>`;
  await sendEmail(to, subject, text, html);
};

export default {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  contactForm
};
