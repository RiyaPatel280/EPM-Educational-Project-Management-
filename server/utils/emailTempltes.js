// export function generateVerificationOtpEmailTemplate(otpCode){
//     return `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #111827;">
//   <h2 style="color: #fff; text-align: center;">Verify Your Email Address</h2>
//   <p style="font-size: 16px; color: #ccc;">Dear User,</p>
//   <p style="font-size: 16px; color: #ccc;">
//     To complete your registration or login, please use the following One-Time Password (OTP):
//   </p>

//   <div style="text-align: center; margin: 20px 0;">
//     <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #000; background: #fff; padding: 10px 20px; border-radius: 6px;">
//       ${otpCode}
//     </span>
//   </div>

//   <p style="font-size: 16px; color: #ccc;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
//   <p style="font-size: 16px; color: #ccc;">If you did not request this email, please ignore it.</p>

//   <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
//     <p>Thank you,<br><b>Bookworm Team</b></p>
//     <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
//   </footer>
// </div>`;

// }


export function generateForgetPasswordEmailTemplate(resetPasswordUrl) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
    
    <h2 style="text-align: center; color: #2c3e50; margin-bottom: 5px;">
      FYP SYSTEM - 🔐 Password Reset Request
    </h2>
    <p style="text-align: center; font-size: 14px; color: #777;">
      Secure access to your learning journey
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

    <p style="font-size: 16px; color: #333;">Dear User,</p>

    <p style="font-size: 16px; color: #333;">
      We received a request to reset your password. Please click the button below to set up a new one:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetPasswordUrl}"
         style="background-color: #1976d2; color: #ffffff; padding: 12px 25px; 
                text-decoration: none; font-size: 16px; font-weight: bold; 
                border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #555;">
      If you did not request this, you can safely ignore this email. This link will expire in 15 minutes.
    </p>

    <p style="font-size: 14px; color: #555;">
      If the button above doesn’t work, copy and paste the following link into your browser:
    </p>

    <p style="font-size: 14px; color: #1976d2; word-break: break-all;">
      ${resetPasswordUrl}
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

    <div style="text-align: center; font-size: 13px; color: #888;">
      <p>Thank you,<br/>BookWorm Team</p>
      <p style="font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>

  </div>
  `;
}

/**
 * Request Accepted Email
 */
export function generateRequestAcceptedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#10b981;">✅ Supervisor Request Accepted</h2>
      <p>Your supervisor request has been accepted by <strong>${supervisorName}</strong>.</p>
      <p>You can now start working on your project and upload files.</p>
    </div>
  `;
}

/**
 * Request Rejected Email
 */
export function generateRequestRejectedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#ef4444;">❌ Supervisor Request Rejected</h2>
      <p>Your supervisor request has been rejected by <strong>${supervisorName}</strong>.</p>
      <p>You can try requesting another supervisor.</p>
    </div>
  `;
}
