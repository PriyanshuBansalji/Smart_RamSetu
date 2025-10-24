const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configure your transporter (use your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: "your_admin_email@gmail.com",
    pass: "your_email_password_or_app_password",
  },
});

router.post("/feedback-admin", async (req, res) => {
  const { feedback, email, donorId, name } = req.body;
  if (!feedback) return res.status(400).json({ error: "Feedback required" });

  const mailOptions = {
    from: '"RamSetu Feedback" <your_admin_email@gmail.com>',
    to: "admin@yourdomain.com", // admin email
    subject: "New Donor Feedback Received",
    text: `Feedback: ${feedback}\nFrom: ${name || "Unknown"} (${email || "No email"})\nDonor ID: ${donorId || "N/A"}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Nodemailer error:", err);
    res.status(500).json({ error: "Failed to send feedback email" });
  }
});

module.exports = router;
