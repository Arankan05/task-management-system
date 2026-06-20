const nodemailer = require("nodemailer");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim();

const transporter =
    EMAIL_USER && EMAIL_PASS
        ? nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: EMAIL_USER,
                  pass: EMAIL_PASS,
              },
          })
        : null;

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

async function sendPasswordResetOtp(email, name, otp) {
    if (!transporter) {
        throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS in .env");
    }

    await transporter.sendMail({
        from: `"TASKPULSE" <${EMAIL_USER}>`,
        to: email,
        subject: "Your TASKPULSE password reset code",
        html: buildOtpEmailHtml(name, otp),
        text: `Your TASKPULSE password reset code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
}

module.exports = {
    sendPasswordResetOtp,
    OTP_EXPIRY_MINUTES,
};
