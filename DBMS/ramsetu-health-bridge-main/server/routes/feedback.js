import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Feedback model (reuse or create new for feedback)
import mongoose from "mongoose";
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: String,
  donorId: String,
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

// POST /api/feedback - save feedback and send mail to admin
router.post("/", async (req, res) => {
  const { name, email, feedback, donorId } = req.body;
  if (!feedback) return res.status(400).json({ message: "Feedback required" });
  try {
    // Save feedback to DB
    await Feedback.create({ name, email, feedback, donorId });
    // Send email to admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Feedback from ${name || "Donor"}`,
      html: `<b>Name:</b> ${name || "N/A"}<br/><b>Email:</b> ${email || "N/A"}<br/><b>Donor ID:</b> ${donorId || "N/A"}<br/><b>Feedback:</b><br/>${feedback}`,
    });
    return res.json({ message: "Thank you for your feedback!" }); // <-- ensure return here
  } catch (err) {
    // Enhanced error logging for debugging
    console.error("Feedback mail error:", err && err.message ? err.message : err);
    console.error("Full error object:", err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to send feedback. Try again later." });
    }
  }
});

export default router;
