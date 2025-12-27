/**
 * Email service with retry logic and proper error handling
 */

import nodemailer from 'nodemailer';
import { logger, retryAsync } from './errorHandler.js';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email with retry logic
 */
export const sendEmail = async (
  to,
  subject,
  html,
  { maxRetries = 3, delayMs = 1000 } = {}
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn("Email service not configured", { to, subject });
    return { success: false, reason: "Email service not configured" };
  }

  try {
    const transporter = createTransporter();

    const result = await retryAsync(
      async () => {
        return await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          html,
        });
      },
      maxRetries,
      delayMs
    );

    logger.info("Email sent successfully", { to, subject });
    return { success: true, messageId: result.messageId };
  } catch (err) {
    logger.error("Failed to send email", { to, subject, error: err.message });
    return { success: false, reason: err.message };
  }
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otpCode) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669; margin-bottom: 20px;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Your OTP for RamSetu signup is:
        </p>
        <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #059669; margin-bottom: 20px;">
          <p style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; margin: 0;">${otpCode}</p>
        </div>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
          This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
        </p>
        <p style="font-size: 12px; color: #999;">
          RamSetu Health Bridge Team<br/>
          ${new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, "Your RamSetu Signup OTP", html, { maxRetries: 2 });
};

/**
 * Send match request notification to patient
 */
export const sendMatchRequestNotificationPatient = async (patientEmail, patientName, organ, donorName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669; margin-bottom: 20px;">✓ Your ${organ} Match Request Submitted</h2>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Dear ${patientName || 'Patient'},
        </p>
        <p style="margin-bottom: 20px;">
          Your organ match request has been submitted to our admin team for verification and approval.
        </p>
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #059669; background-color: #f0fdf4;">
          <p style="margin: 0; font-weight: bold;">Request Details:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Organ Required:</strong> ${organ}</li>
            <li><strong>Status:</strong> Pending Admin Verification</li>
            <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</li>
          </ul>
        </div>
        <p style="margin-bottom: 20px;">
          <strong>What's Next?</strong>
        </p>
        <ol style="margin-bottom: 20px;">
          <li>Our admin team will review the match compatibility within 24 hours</li>
          <li>We'll verify medical tests and blood group compatibility</li>
          <li>You'll receive an email notification once the request is approved</li>
        </ol>
        <p style="font-size: 12px; color: #999;">
          RamSetu Health Bridge Team
        </p>
      </div>
    </div>
  `;

  return sendEmail(patientEmail, `✓ Your ${organ} Match Request Submitted`, html);
};

/**
 * Send match request notification to admin
 */
export const sendMatchRequestNotificationAdmin = async (adminEmail, organ, patientName, patientEmail, donorName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">🔴 New Match Request for Admin Review</h2>
        <p style="margin-bottom: 20px;">
          A new patient organ match request requires your immediate review.
        </p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #fecaca; background-color: #fef2f2;">
          <p style="margin: 0; font-weight: bold;">Match Details:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Organ:</strong> ${organ}</li>
            <li><strong>Patient:</strong> ${patientName || 'Unknown'} (${patientEmail || 'N/A'})</li>
            <li><strong>Donor:</strong> ${donorName || 'Unknown'}</li>
          </ul>
        </div>
        <p style="color: #dc2626; margin: 20px 0;">
          <strong>ACTION REQUIRED:</strong> Please log into the admin panel to review and approve/reject this match.
        </p>
        <p style="font-size: 12px; color: #999;">
          RamSetu System
        </p>
      </div>
    </div>
  `;

  return sendEmail(adminEmail, `[URGENT] New Organ Match Request - ${organ}`, html, { maxRetries: 2 });
};

/**
 * Send match approval notification
 */
export const sendMatchApprovalNotification = async (patientEmail, patientName, organ, donorName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669; margin-bottom: 20px;">✅ Match Approved!</h2>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Dear ${patientName || 'Patient'},
        </p>
        <p style="margin-bottom: 20px;">
          Great news! Your ${organ} match request has been approved by our medical team.
        </p>
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #059669; background-color: #f0fdf4;">
          <p style="margin: 0; font-weight: bold;">Next Steps:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Our coordination team will contact you shortly</li>
            <li>Medical tests will be scheduled</li>
            <li>Surgery date will be confirmed</li>
          </ul>
        </div>
        <p style="margin-bottom: 20px;">
          We're here to support you through this journey. If you have any questions, please don't hesitate to contact us.
        </p>
        <p style="font-size: 12px; color: #999;">
          RamSetu Health Bridge Team
        </p>
      </div>
    </div>
  `;

  return sendEmail(patientEmail, `✅ Your ${organ} Match Has Been Approved!`, html);
};

export default {
  sendEmail,
  sendOTPEmail,
  sendMatchRequestNotificationPatient,
  sendMatchRequestNotificationAdmin,
  sendMatchApprovalNotification,
};
