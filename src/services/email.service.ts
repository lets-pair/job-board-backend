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

/**
 * Send Reminder email
 * @param {string} to
 * @returns {Promise}
 */

const sendPairReminderEmail = async (
  to: string,
  name: string,
  startTime: string,
  date: string,
  station: string
) => {
  const time24 = startTime;
  const time12 = moment(time24, 'HH:mm').format('hh:mm A');
  console.log(time12);
  const subject = 'Appointment Reminder';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
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
    img {
      max-width: 100%;
      height: auto;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
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
  <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <!-- Header with Image -->
    <tr>
      <td>
        <img src="https://letspair.s3.us-west-2.amazonaws.com/reminder-email/match.png" alt="Pair Programming" style="display: block; width: 100%;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; color: #333333;">It's a match! 🐝</h1>
        <p style="font-size: 18px; color: #555555; line-height: 1.5;">You've Found Your Coding Buddy!</p>
        <h2 style="font-size: 24px; color: #333333;">Your appointment has been booked.</h2>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: left; padding: 10px 0;">
              <strong>Session Details:</strong>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Date:</strong> ${date}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Time:</strong> ${time12}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Station:</strong> ${station}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Location:</strong> 320 Granville St #1340, Vancouver, BC, V6C 1S9
            </td>
          </tr>
        </table>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">We're looking forward to seeing you! If you have any questions or need to reschedule, please contact us. Please watch the following video to prepare for your appointment:</p>
        <a href="https://youtu.be/hOtC_LhYHN8" class="button" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Get Ready</a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://letspair.s3.us-west-2.amazonaws.com/Trademark.png" alt="Company Logo" style="max-width: 100px; height: auto; margin-bottom: 10px;">
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">320 Granville St #1340, Vancouver, BC, V6C 1S9</p>
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">Phone: (778) 889-7247 | Email: info@letspair.ca</p>
        <div class="social-media">
          <a href="https://www.facebook.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
          <a href="https://x.com/Lets_Pair_1"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
          <a href="https://www.instagram.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
          <a href="https://ca.linkedin.com/company/letspairedu"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
        </div>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
  const text = `Hi ${name},

It's a match! 🐝
You've Found Your Coding Buddy!

Your appointment has been booked.

Session Details:
Date: ${date}
Time: ${time12}
Station: ${station}
Location: 320 Granville St #1340, Vancouver, BC, V6C 1S9
If you are lost here is a video to help you get there: https://www.youtube.com/shorts/LUooz_iow2U

Get Ready by watching this video: https://youtu.be/hOtC_LhYHN8

We’re looking forward to seeing you! If you have any questions or need to reschedule, please contact us.

Phone: (778) 889-7247 | Email: info@letspair.ca`;
  await sendEmail(to, subject, text, html);
};

const sendSoloReminderEmail = async (
  to: string,
  name: string,
  startTime: string,
  date: string,
  station: string
) => {
  const time24 = startTime;
  const time12 = moment(time24, 'HH:mm').format('hh:mm A');
  const subject = 'Appointment Reminder';
  const text = `Hi ${name},
This is a friendly reminder that your appointment is coming up!

Session Details:
Date: ${date}
Time: ${time12}
Station: ${station}
Location: 320 Granville St #1340, Vancouver, BC, V6C 1S9
If you are lost here is a video to help you get there: https://www.youtube.com/shorts/LUooz_iow2U

Prepare for your session by watching this video: https://youtu.be/hOtC_LhYHN8
We're excited to see you soon! If you have any questions or need to reschedule, please contact us as soon as possible.

Phone: (778) 889-7247 | Email: info@letspair.ca`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
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
    img {
      max-width: 100%;
      height: auto;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
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
  <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <!-- Header with Image -->
    <tr>
      <td>
        <img src="https://letspair.s3.us-west-2.amazonaws.com/reminder-email/reminder.png" alt="Pair Programming" style="display: block; width: 100%;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; color: #333333;">Friendly Reminder: Your Appointment is Coming Up!</h1>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: left; padding: 10px 0;">
              <strong>Session Details:</strong>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Date:</strong> ${date}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Time:</strong> ${time12}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Station:</strong> ${station}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Location:</strong> 320 Granville St #1340, Vancouver, BC, V6C 1S9
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              If you are <strong>lost</strong> here is a video to help you get there: https://www.youtube.com/shorts/LUooz_iow2U
            </td>
          </tr>
        </table>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">We’re excited to see you soon! To make the most of your session, please watch the following video to prepare:</p>
        <a href="https://youtube.com/shorts/Hk8IL0MX828?feature=shared" class="button" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Prepare Now</a>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">If you have any questions or need to reschedule, please contact us as soon as possible.</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://letspair.s3.us-west-2.amazonaws.com/Trademark.png" alt="Company Logo" style="max-width: 100px; height: auto; margin-bottom: 10px;">
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">320 Granville St #1340, Vancouver, BC, V6C 1S9</p>
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">Phone: (778) 889-7247 | Email: info@letspair.ca</p>
        <div class="social-media">
          <a href="https://www.facebook.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
          <a href="https://x.com/Lets_Pair_1"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
          <a href="https://www.instagram.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
          <a href="https://ca.linkedin.com/company/letspairedu"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  await sendEmail(to, subject, text, html);
};

const sendRescheduleAppointmentEmail = async (
  to: string,
  name: string,
  startTime: string,
  date: string
) => {
  const time24 = startTime;
  const time12 = moment(time24, 'HH:mm').format('hh:mm A');
  const subject = 'Appointment Reschedule';
  const text = `Dear ${name},
    Your appointment is has been rescheduled for ${date} at ${time12}.
    `;
  await sendEmail(to, subject, text);
};

const sendConsentFormEmail = async (to: string, name: string) => {
  const subject = 'Consent Form';
  const text = `Dear ${name}'s guardian,
  Please sign and upload the attached consent form.`;
  const path: string = config.consent_form_url;
  const attachments = [
    {
      filename: 'consent.pdf',
      path: path,
      contentType: 'application/pdf'
    }
  ];
  await sendEmail(to, subject, text, undefined, attachments);
};

const sendAppointmentConfirmationEmail = async (
  to: string,
  name: string,
  startTime: string,
  date: string
) => {
  const time24 = startTime;
  const time12 = moment(time24, 'HH:mm').format('hh:mm A');
  const subject = 'Appointment Confirmation';
  const text = `Hi ${name}, Your appointment has been booked.

  Session Details:
Date: ${date}
Time: ${time12}
Location: 320 Granville St #1340, Vancouver, BC, V6C 1S9

Get Ready by watching this video: https://youtu.be/hOtC_LhYHN8
We’re looking forward to seeing you! If you have any questions or need to reschedule, please contact us.
Phone: (778) 889-7247 | Email: info@letspair.ca`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
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
    img {
      max-width: 100%;
      height: auto;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
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
  <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <!-- Header with Image -->
    <tr>
      <td>
        <img src="https://letspair.s3.us-west-2.amazonaws.com/pair-programming.png" alt="Pair Programming" style="display: block; width: 100%;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; color: #333333;">Your appointment has been booked.</h1>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: left; padding: 10px 0;">
              <strong>Session Details:</strong>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Date:</strong> ${date}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Time:</strong> ${time12}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Location:</strong> 320 Granville St #1340, Vancouver, BC, V6C 1S9
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              If you are <strong>lost</strong> here is a video to help you get there: https://www.youtube.com/shorts/LUooz_iow2U
            </td>
          </tr>
        </table>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">We’re looking forward to seeing you! If you have any questions or need to reschedule, please contact us. Please watch the following video to prepare for your appointment</p>
        <a href="https://youtube.com/shorts/Hk8IL0MX828?feature=shared" class="button" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Prepare Now</a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://letspair.s3.us-west-2.amazonaws.com/Trademark.png" alt="Company Logo" style="max-width: 100px; height: auto; margin-bottom: 10px;">
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">320 Granville St #1340, Vancouver, BC, V6C 1S9</p>
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">Phone: (778) 889-7247 | Email: info@letspair.ca</p>
        <div class="social-media">
          <a href="https://www.facebook.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
          <a href="https://x.com/Lets_Pair_1"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
          <a href="https://www.instagram.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
          <a href="https://ca.linkedin.com/company/letspairedu"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  await sendEmail(to, subject, text, html);
};

const sendPostSessionEmail = async (to: string) => {
  const subject = "Subject: We'd Love Your Feedback!";
  const text = `Thank You for Attending!

We hope you enjoyed your pair programming session! Your feedback helps us improve and provide a better experience for all participants.

Give Feedback: https://forms.gle/fWiu1MLCb4ZnBkWz6

If you had a great experience, we'd love for you to leave us a Google review!

Leave a Review: https://g.co/kgs/QSbKsZ5

---

320 Granville St #1340, Vancouver, BC, V6C 1S9
Phone: (778) 889-7247 | Email: info@letspair.ca

Follow us:
Facebook: https://facebook.com
Twitter: https://twitter.com
Instagram: https://instagram.com
LinkedIn: https://linkedin.com
`;
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>We'd Love Your Feedback!</title>
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
      img {
        max-width: 100%;
        height: auto;
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
      <!-- Header with Image -->
      <tr>
        <td>
          <img
            src="https://letspair.s3.us-west-2.amazonaws.com/reminder-email/feedback.jpg"
            alt="Pair Programming"
            style="display: block; width: 100%"
          />
        </td>
      </tr>

      <!-- Main Content -->
      <tr>
        <td style="padding: 20px; text-align: center">
          <h1 style="font-size: 24px; color: #333333">
            Thank You for Attending!
          </h1>
          <p style="font-size: 16px; color: #555555; line-height: 1.5">
            We hope you enjoyed your pair programming session! Your feedback
            helps us improve and provide a better experience for all
            participants.
          </p>
          <a
            href="https://forms.gle/fWiu1MLCb4ZnBkWz6"
            class="button"
            style="margin: 20px 0; color: #ffffff"
            >Give Feedback</a
          >
          <p style="font-size: 16px; color: #555555">
            If you had a great experience, we'd love for you to leave us a
            Google review!
          </p>
          <a
            href="https://g.co/kgs/QSbKsZ5"
            class="button"
            style="background-color: #34a853; color: #ffffff"
            >Leave a Review</a
          >
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
          <a href="https://www.facebook.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
          <a href="https://x.com/Lets_Pair_1"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
          <a href="https://www.instagram.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
          <a href="https://ca.linkedin.com/company/letspairedu"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
        </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  await sendEmail(to, subject, text, html);
};

const sendMorningReminderEmail = async (
  to: string,
  name: string,
  startTime: string,
  date: string
) => {
  const time24 = startTime;
  const time12 = moment(time24, 'HH:mm').format('hh:mm A');
  const subject = 'Appointment Reminder';
  const text = `Hi ${name},
This is a friendly reminder that your appointment is coming up!

Session Details:
Date: ${date}
Time: ${time12}
Location: 320 Granville St #1340, Vancouver, BC, V6C 1S9
If you are lost here is a video to help you get there: https://www.youtube.com/shorts/LUooz_iow2U

Prepare for your session by watching this video: https://youtu.be/hOtC_LhYHN8
We're excited to see you soon! If you have any questions or need to reschedule, please contact us as soon as possible.

Phone: (778) 889-7247 | Email: info@letspair.ca`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
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
    img {
      max-width: 100%;
      height: auto;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
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
  <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <!-- Header with Image -->
    <tr>
      <td>
        <img src="https://letspair.s3.us-west-2.amazonaws.com/reminder-email/morning-reminder.png" alt="Pair Programming" style="display: block; width: 100%;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; color: #333333;">Friendly Reminder: Your Appointment is Coming Up!</h1>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: left; padding: 10px 0;">
              <strong>Session Details:</strong>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Date:</strong> ${date}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Time:</strong> ${time12}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Location:</strong> 320 Granville St #1340, Vancouver, BC, V6C 1S9
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              If you are <strong>lost</strong> here is a video to help you get there: https://www.youtube.com/shorts/LUooz_iow2U
            </td>
          </tr>
        </table>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">We’re excited to see you soon! To make the most of your session, please watch the following video to prepare:</p>
        <a href="https://youtube.com/shorts/Hk8IL0MX828?feature=shared" class="button" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Prepare Now</a>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">If you have any questions or need to reschedule, please contact us as soon as possible.</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://letspair.s3.us-west-2.amazonaws.com/Trademark.png" alt="Company Logo" style="max-width: 100px; height: auto; margin-bottom: 10px;">
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">320 Granville St #1340, Vancouver, BC, V6C 1S9</p>
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">Phone: (778) 889-7247 | Email: info@letspair.ca</p>
        <div class="social-media">
          <a href="https://www.facebook.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
          <a href="https://x.com/Lets_Pair_1"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
          <a href="https://www.instagram.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
          <a href="https://ca.linkedin.com/company/letspairedu"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  await sendEmail(to, subject, text, html);
};

const sendCancelationEmail = async (to: string, name: string, startTime: string, date: string) => {
  const time24 = startTime;
  const time12 = moment(time24, 'HH:mm').format('hh:mm A');
  const subject = 'Appointment Cancellation';
  const text = `Hi ${name},

We're sorry to inform you that your appointment has been canceled.

Cancelled Session Details:
Date: ${date}
Time: ${time12}
Location: 320 Granville St #1340, Vancouver, BC, V6C 1S9

We'd love to reschedule! Book a new appointment here:
https://letspair.ca/booking

If you have questions, contact us at:
Phone: (778) 889-7247 | Email: info@letspair.ca
`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Cancellation Notice</title>
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
    img {
      max-width: 100%;
      height: auto;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
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
  <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <!-- Header with Image -->
    <tr>
      <td>
        <img src="https://letspair.s3.us-west-2.amazonaws.com/email/cancellation.png" alt="Pair Programming" style="display: block; width: 100%;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; color: #333333;">Your Appointment Has Been Canceled</h1>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: left; padding: 10px 0;">
              <strong>Cancelled Session Details:</strong>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Date:</strong> ${date}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Time:</strong> ${time12}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 5px 0;">
              <strong>Location:</strong> 320 Granville St #1340, Vancouver, BC, V6C 1S9
            </td>
          </tr>
        </table>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">We're sorry to inform you that your scheduled appointment has been canceled. We value your time and would love to reschedule at your convenience.</p>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">Please click the button below to book a new appointment that works best for you.</p>
        <a href="https://letspair.ca/booking" class="button" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Rebook Now</a>
        <p style="font-size: 16px; color: #555555; line-height: 1.5;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://letspair.s3.us-west-2.amazonaws.com/Trademark.png" alt="Company Logo" style="max-width: 100px; height: auto; margin-bottom: 10px;">
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">320 Granville St #1340, Vancouver, BC, V6C 1S9</p>
        <p style="font-size: 14px; color: #777777; margin: 5px 0;">Phone: (778) 889-7247 | Email: info@letspair.ca</p>
        <div class="social-media">
          <a href="https://www.facebook.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
          <a href="https://x.com/Lets_Pair_1"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/x.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
          <a href="https://www.instagram.com/letspair.ca/"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
          <a href="https://ca.linkedin.com/company/letspairedu"><img src="https://letspair.s3.us-west-2.amazonaws.com/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
  sendPairReminderEmail,
  sendSoloReminderEmail,
  sendRescheduleAppointmentEmail,
  sendConsentFormEmail,
  sendAppointmentConfirmationEmail,
  sendPostSessionEmail,
  sendMorningReminderEmail,
  sendCancelationEmail,
  contactForm
};
