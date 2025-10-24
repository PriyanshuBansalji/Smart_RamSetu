const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configure transporter (replace with your credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_admin_email@gmail.com",
    pass: "your_gmail_app_password",
  },
});

router.post("/", async (req, res) => {
  const { feedback, email, donorId, name } = req.body;
  if (!feedback) {
    console.error("Feedback missing in request body");
    return res.status(400).json({ error: "Feedback required" });
  }

  // Optionally save feedback to DB here

  // Send mail to admin
  try {
    await transporter.sendMail({
      from: '"RamSetu Feedback" <your_admin_email@gmail.com>',
      to: "admin@yourdomain.com",
      subject: "New Donor Feedback Received",
      text: `Feedback: ${feedback}\nFrom: ${name || "Unknown"} (${email || "No email"})\nDonor ID: ${donorId || "N/A"}`,
    });
    res.json({ success: true });
  } catch (err) {
    // This will show the error in your terminal
    console.error("Nodemailer error:", err);
    res.status(500).json({ error: "Failed to send feedback email" });
  }
});

module.exports = router;
