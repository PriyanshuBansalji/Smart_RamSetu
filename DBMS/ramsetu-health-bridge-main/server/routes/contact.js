import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Feedback model (simple, for demonstration)
import mongoose from "mongoose";
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

// POST /api/contact - send mail and save feedback
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "All fields required" });
  try {
    // Save feedback to DB
    await Feedback.create({ name, email, message });
    // Send email
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
      subject: `New Contact/Feedback from ${name}`,
      html: `<b>Name:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Message:</b><br/>${message}`,
    });
    res.json({ message: "Thank you for your feedback!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message. Try again later." });
  }
});

export default router;
