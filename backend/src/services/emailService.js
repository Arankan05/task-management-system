const nodemailer = require("nodemailer");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim();

const isPlaceholder = (user, pass) => {
  return (
    !user ||
    !pass ||
    user.includes("your-gmail") ||
    pass.includes("your-16-char")
  );
};

const transporter =
  EMAIL_USER && EMAIL_PASS && !isPlaceholder(EMAIL_USER, EMAIL_PASS)
    ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
    : null;

// [FORGOT PASSWORD] OTP email — sent when user requests a password reset
const OTP_EXPIRY_MINUTES = 10;

function buildOtpEmailHtml(name, otp) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">TASKPULSE</h1>
              <p style="margin:8px 0 0;color:#ede9fe;font-size:13px;">Password Reset</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#1E293B;font-size:15px;">Hi ${name || "there"},</p>
              <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                Use the verification code below to reset your password. This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
              </p>
              <div style="background:#f5f3ff;border:2px dashed #A855F7;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7C3AED;">${otp}</span>
              </div>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; TASKPULSE &mdash; Track &amp; Achieve</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** [FORGOT PASSWORD] Sends the 6-digit OTP to the user's inbox (requires EMAIL_USER / EMAIL_PASS). */
async function sendPasswordResetOtp(email, name, otp) {
  console.log(`\n==================================================\n[EMAIL BYPASS] Password Reset OTP for ${email}:\nCode: ${otp}\n==================================================\n`);
  if (!transporter) {
    console.warn("⚠️ Email service is not configured. Reset code printed above.");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"TASKPULSE" <${EMAIL_USER}>`,
      to: email,
      subject: "Your TASKPULSE password reset code",
      html: buildOtpEmailHtml(name, otp),
      text: `Your TASKPULSE password reset code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
    return true;
  } catch (err) {
    console.error(`❌ Failed to send password reset email to ${email}:`, err.message);
    return false;
  }
}

const ROLE_DISPLAY = {
  ADMINISTRATOR: "Admin",
  PROJECT_MANAGER: "Manager",
  COLLABORATOR: "Member",
};

function buildInvitationEmailHtml({ workspaceName, inviterName, role, inviteLink }) {
  const roleLabel = ROLE_DISPLAY[role] || role;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">TASKPULSE</h1>
              <p style="margin:8px 0 0;color:#ede9fe;font-size:13px;">Workspace Invitation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#1E293B;font-size:15px;">You've been invited!</p>
              <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
                <strong>${inviterName}</strong> invited you to join the workspace
                <strong>${workspaceName}</strong> as <strong>${roleLabel}</strong>.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${inviteLink}" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
                  Accept Invitation
                </a>
              </div>
              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.5;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 20px;color:#7C3AED;font-size:12px;word-break:break-all;">${inviteLink}</p>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                This invitation expires in 7 days. If you did not expect this email, you can ignore it.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; TASKPULSE &mdash; Track &amp; Achieve</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeUserHtml({ name, emailAddress, tempPassword, loginUrl, expiresInHours = 24 }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">TASKPULSE</h1>
              <p style="margin:8px 0 0;color:#ede9fe;font-size:13px;">Welcome to the team</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#1E293B;font-size:15px;">Hi ${name || "there"},</p>
              <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
                An administrator created your TASKPULSE account. Sign in with the credentials below.
                The temporary password is valid for <strong>${expiresInHours} hours</strong>.
                After signing in, set a new password, then accept or reject the workspace invitation in your notifications.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;">
                <p style="margin:0 0 8px;color:#64748b;font-size:13px;"><strong>Username:</strong> ${emailAddress}</p>
                <p style="margin:0;color:#64748b;font-size:13px;"><strong>Temporary password:</strong> <code style="color:#7C3AED;font-size:15px;">${tempPassword}</code></p>
              </div>
              <div style="text-align:center;margin:24px 0;">
                <a href="${loginUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
                  Sign In to TASKPULSE
                </a>
              </div>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                For security, change this temporary password immediately after signing in.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendWelcomeUserEmail({ to, name, emailAddress, tempPassword, expiresInHours = 24 }) {
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;
  console.log(`\n==================================================\n[EMAIL BYPASS] Welcome Email to ${to}:\nTemp Password: ${tempPassword}\nLogin URL: ${loginUrl}\n==================================================\n`);
  if (!transporter) {
    console.warn("⚠️ Email service is not configured. Account details printed above.");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"TASKPULSE" <${EMAIL_USER}>`,
      to,
      subject: "Your TASKPULSE account has been created",
      html: buildWelcomeUserHtml({ name, emailAddress, tempPassword, loginUrl, expiresInHours }),
      text: `Your TASKPULSE account was created. Username: ${emailAddress}. Temporary password: ${tempPassword} (valid ${expiresInHours} hours). Sign in at ${loginUrl}, set a new password, then accept or reject the workspace invitation in notifications.`,
    });
    return true;
  } catch (err) {
    console.error(`❌ Failed to send welcome email to ${to}:`, err.message);
    return false;
  }
}

async function sendWorkspaceInvitation({ to, workspaceName, inviterName, role, inviteLink }) {
  const roleLabel = ROLE_DISPLAY[role] || role;
  console.log(`\n==================================================\n[EMAIL BYPASS] Workspace Invitation to ${to}:\nWorkspace: ${workspaceName}\nRole: ${roleLabel}\nInvite Link: ${inviteLink}\n==================================================\n`);
  if (!transporter) {
    console.warn("⚠️ Email service is not configured. Invitation link printed above.");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"TASKPULSE" <${EMAIL_USER}>`,
      to,
      subject: `You're invited to join "${workspaceName}" on TASKPULSE`,
      html: buildInvitationEmailHtml({ workspaceName, inviterName, role, inviteLink }),
      text: `${inviterName} invited you to join ${workspaceName} as ${roleLabel}. Accept here: ${inviteLink} (expires in 7 days)`,
    });
    return true;
  } catch (err) {
    console.error(`❌ Failed to send invitation email to ${to}:`, err.message);
    return false;
  }
}

module.exports = {
  sendPasswordResetOtp,
  sendWelcomeUserEmail,
  sendWorkspaceInvitation,
  OTP_EXPIRY_MINUTES,
};
