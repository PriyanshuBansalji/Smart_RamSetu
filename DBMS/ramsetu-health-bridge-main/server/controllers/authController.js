import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

console.log("DEBUG EMAIL_USER:", process.env.EMAIL_USER, "DEBUG EMAIL_PASS:", process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const signup = async (req, res) => {
  try {
    const { email, password, role, name, age, gender, contact, bloodGroup, organ, requiredOrgan } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });
    const existing = await User.findOne({ email, role });
    if (existing) return res.status(400).json({ message: `Email already registered for role: ${role}` });
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await Otp.deleteMany({ email }); // Remove old OTPs
    await Otp.create({ email, code: otpCode, expiresAt });
    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your RamSetu Signup OTP",
      html: `<p>Your OTP for RamSetu signup is: <b>${otpCode}</b>. It is valid for 10 minutes.</p>`
    });
    res.status(201).json({ message: "OTP sent to email. Please verify to complete signup." });
  } catch (err) {
    console.error("Signup error:", err); // Add this line
    res.status(500).json({ message: err.message });
  }
};

export const verifyOtpAndCreateUser = async (req, res) => {
  try {
  const { email, otp, password, role, name, age, gender, contact, bloodGroup, organ, requiredOrgan } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });
    // If already exists for this (email, role), block duplicate creation
    const exists = await User.findOne({ email, role });
    if (exists) return res.status(400).json({ message: `Email already registered for role: ${role}` });
    const otpDoc = await Otp.findOne({ email, code: otp, verified: false });
    if (!otpDoc) return res.status(400).json({ message: "Invalid OTP" });
    if (otpDoc.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });
    otpDoc.verified = true;
    await otpDoc.save();
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hash,
      role,
      name,
      age,
      gender,
      contact,
      bloodGroup,
      organ,
      requiredOrgan,
      isVerified: true,
    });
  // Issue JWT token for immediate profile creation
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ message: "Signup successful.", token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid token" });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: "Email verified. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(403).json({ message: "Email not verified" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
