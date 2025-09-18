const transporter = require("../config/nodemailer");
if (process.env.NODE_ENV !== "production") require('dotenv').config();

async function welcomeEmail(to, name) {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to Campus Connect</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  </head>
  <body class="bg-light">
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg border-0 rounded-3">
            <div class="card-header bg-success text-white text-center py-3">
              <h2 class="mb-0">🎓 Welcome to Campus Connect</h2>
            </div>
            <div class="card-body p-4">
              <h4 class="card-title">Hi ${name},</h4>
              <p class="card-text">
                We’re excited to have you on board! 🎉
              </p>
              <p class="card-text">
                Campus Connect is your space to collaborate, share resources, and grow with your peers. 
                You can now:
              </p>
              <ul>
                <li>Join study groups and discussions</li>
                <li>Share and access learning resources</li>
                <li>Stay updated with schedules and events</li>
              </ul>
              <div class="text-center my-4">
                <a href="${process.env.FRONTEND_URL}/login" target="_blank" class="btn btn-success btn-lg">
                  Go to Dashboard
                </a>
              </div>
              <p class="text-muted">
                We can’t wait to see you thrive with your fellow students 🚀
              </p>
              <p class="mb-0">Cheers,<br/>Campus Connect Team</p>
            </div>
            <div class="card-footer bg-light text-center small text-muted">
              Need help? Contact us at 
              <a href="mailto:${process.env.APPLICATION_EMAIL}">${process.env.APPLICATION_EMAIL}</a>
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // Plain-text fallback
  const text = `
  Welcome to Campus Connect!

  Hi ${name},

  We're excited to have you join our platform! 
  You can now:
  - Join study groups and discussions
  - Share and access learning resources
  - Stay updated with schedules and events

  Login here: ${process.env.FRONTEND_URL}/login

  Cheers,
  Campus Connect Team
  `;

  // Sending mail
  const info = await transporter.sendMail({
    from: `"Campus Connect" <${process.env.APPLICATION_EMAIL}>`,
    to,
    subject: "Welcome to Campus Connect 🎓",
    text,
    html,
  });

  console.log("✅ Welcome email sent:", info.messageId);
}

async function sendActivationEmail(activationToken, email, username) {
  try {
    // Plain text fallback
    const textContent = `
      Hi ${username},

      Thanks for signing up for Campus Connect 🎉

      To activate your account, please click the link below:
      ${process.env.FRONTEND_URL}/activate/${activationToken}

      If you didn’t create this account, you can safely ignore this email.

      - Campus Connect Team
    `;

    // HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Activate Your Account</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f7;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.1);
        }
        h2 {
          color: #333333;
        }
        p {
          color: #555555;
          font-size: 15px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          margin: 20px 0;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: #ffffff !important;
          text-decoration: none;
          font-size: 16px;
          font-weight: bold;
          border-radius: 6px;
        }
        .footer {
          margin-top: 20px;
          font-size: 13px;
          color: #999999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Campus Connect 🎉</h2>
        <p>Hi <b>${username}</b>,</p>
        <p>Thanks for signing up! To start using your account, please verify your email by clicking the button below:</p>

        <a href="${process.env.FRONTEND_URL}/activate/${activationToken}" class="button">Activate Account</a>

        <p>If you didn’t create this account, you can safely ignore this email.</p>

        <div class="footer">
          <p>© 2025 Campus Connect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log("Email: ", email);
    
    // Mail options
    const mailOptions = {
      from: `"Campus Connect" <${process.env.APPLICATION_EMAIL}>`,
      to: email,
      subject: "Activate Your Campus Connect Account",
      text: textContent,  // plain text
      html: htmlContent,  // HTML
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Activation email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending activation email:", error);
    throw error;
  }
};

async function requestResetEmail(to, name, resetToken) {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Password Reset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  </head>
  <body class="bg-light">
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg border-0 rounded-3">
            <div class="card-header bg-primary text-white text-center py-3">
              <h2 class="mb-0">Campus Connect</h2>
            </div>
            <div class="card-body p-4">
              <h4 class="card-title">Reset Your Password</h4>
              <p class="card-text">
                Hi <strong>${name}</strong>,
              </p>
              <p class="card-text">
                We received a request to reset your password. Click the button below to set a new one.
                This link will expire in <strong>15 minutes</strong>.
              </p>
              <div class="text-center my-4">
                <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" target="_blank" class="btn btn-primary btn-lg">
                  Reset Password
                </a>
              </div>
              <p class="card-text">
                If the button above doesn’t work, copy and paste the following link into your browser:
              </p>
              <p class="text-break">
                <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" target="_blank">${process.env.FRONTEND_URL}/reset-password/${resetToken}</a>
              </p>
              <hr />
              <p class="text-muted small">
                If you didn’t request this password reset, you can safely ignore this email. Your account remains secure.
              </p>
              <p class="mb-0">Thanks,<br />Campus Connect Team</p>
            </div>
            <div class="card-footer bg-light text-center small text-muted">
              Need help? Contact us at 
              <a href="mailto:${process.env.APPLICATION_EMAIL}">${process.env.APPLICATION_EMAIL}</a>
              <br />
              Regards, Campus Connect
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // Plain text version (for email clients that don’t support HTML)
  const text = `
  Hi ${name},

  We received a request to reset your password.
  Use the link below to set a new one (expires in 15 minutes):

  ${process.env.FRONTEND_URL}/reset-password/${resetToken}

  If you didn’t request this, you can ignore this email.

  Thanks,
  Campus Connect Team
  `;

  // Sending mail
  const info = await transporter.sendMail({
    from: `"Campus Connect" <${process.env.APPLICATION_EMAIL}>`,
    to,
    subject: "Reset Your Password - Campus Connect",
    text,
    html,
  });

  console.log("✅ Email sent:", info.messageId);
}

async function resetConfirmation(to, name) {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Password Updated</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  </head>
  <body class="bg-light">
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg border-0 rounded-3">
            <div class="card-header bg-warning text-dark text-center py-3">
              <h2 class="mb-0">🔒 Password Updated</h2>
            </div>
            <div class="card-body p-4">
              <h4 class="card-title">Hi ${name},</h4>
              <p class="card-text">
                This is a confirmation that your password has been successfully updated using the password reset link.
              </p>
              <p class="card-text text-muted">
                If <strong>you made this change</strong>, no further action is needed.
              </p>
              <p class="card-text text-danger">
                If <strong>you did not update your password</strong>, please reset your password immediately to secure your account.
              </p>
              <div class="text-center my-4">
                <a href="${process.env.FRONTEND_URL}/reset-password" target="_blank" class="btn btn-danger btn-lg">
                  Reset Password Again
                </a>
              </div>
              <p class="mb-0">Stay safe,<br/>Campus Connect Security Team</p>
            </div>
            <div class="card-footer bg-light text-center small text-muted">
              Need help? Contact us at 
              <a href="mailto:${process.env.APPLICATION_EMAIL}">${process.env.APPLICATION_EMAIL}</a>
              <br />
              © ${new Date().getFullYear()} Campus Connect
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // Plain-text fallback
  const text = `
  Password Updated - Campus Connect

  Hi ${name},

  This is a confirmation that your password was successfully updated.

  If you made this change, no further action is required.
  If you did NOT update your password, please reset it immediately at:
  ${process.env.FRONTEND_URL}/reset

  Stay safe,
  Campus Connect Security Team
  `;

  // Sending mail
  const info = await transporter.sendMail({
    from: `"Campus Connect" <${process.env.APPLICATION_EMAIL}>`,
    to,
    subject: "Your Campus Connect Password Was Updated 🔒",
    text,
    html,
  });

  console.log("✅ Password updated email sent:", info.messageId);
}

module.exports = { welcomeEmail, sendActivationEmail, requestResetEmail, resetConfirmation }