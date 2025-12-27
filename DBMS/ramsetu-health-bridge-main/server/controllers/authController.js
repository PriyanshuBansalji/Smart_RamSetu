import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  validateEmail,
  validatePassword,
  validateRole,
  validateSignupRequest,
  validateLoginRequest,
  validateOTP,
  getPasswordStrength,
} from "../utils/validation.js";
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  asyncHandler,
  logger,
} from "../utils/errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const OTP_EXPIRY_MINUTES = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const signup = asyncHandler(async (req, res) => {
  const { email, password, role, name, age, gender, contact, bloodGroup, organ, requiredOrgan } = req.body;

  // Validate input
  const validation = validateSignupRequest({ email, password, role, name });
  if (!validation.isValid) {
    // Check if password is the issue and provide detailed feedback
    const passwordError = validation.errors.find(e => e.includes('Password'));
    if (passwordError) {
      const strength = getPasswordStrength(password);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.errors,
        passwordDetails: {
          strength: strength.strength,
          score: strength.score,
          missing: strength.missing,
          hint: `Password requirements: ${strength.missing.join(', ')}`
        }
      });
    }
    return res.status(400).json({ message: "Validation failed", errors: validation.errors });
  }

  if (bloodGroup && !['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].includes(bloodGroup)) {
    return res.status(400).json({ message: "Invalid blood group" });
  }

  // Check if user already exists
  const existing = await User.findOne({ email, role });
  if (existing) {
    throw new ConflictError(`Email already registered for role: ${role}`);
  }

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.deleteMany({ email }); // Remove old OTPs
  await Otp.create({ email, code: otpCode, expiresAt });

  // Send OTP email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your RamSetu Signup OTP",
      html: `<p>Your OTP for RamSetu signup is: <b>${otpCode}</b>. It is valid for ${OTP_EXPIRY_MINUTES} minutes.</p><p>If you didn't request this, please ignore this email.</p>`,
    });
  } catch (emailErr) {
    logger.error("Failed to send OTP email", emailErr);
    throw new Error("Failed to send OTP. Please try again.");
  }

  logger.info("OTP sent for signup", { email, role });
  res.status(201).json({ message: "OTP sent to email. Please verify to complete signup." });
});

export const verifyOtpAndCreateUser = asyncHandler(async (req, res) => {
  const { email, otp, password, role, name, age, gender, contact, bloodGroup, organ, requiredOrgan } = req.body;

  // Validate inputs
  if (!email || !validateEmail(email)) {
    throw new ValidationError("Invalid email format");
  }
  if (!otp || !validateOTP(otp)) {
    throw new ValidationError("Invalid OTP format");
  }
  if (!role || !validateRole(role)) {
    throw new ValidationError("Invalid role");
  }
  if (!name || !name.trim()) {
    throw new ValidationError("Name is required");
  }

  // Check if user already exists
  const exists = await User.findOne({ email, role });
  if (exists) {
    throw new ConflictError(`Email already registered for role: ${role}`);
  }

  // Verify OTP
  const otpDoc = await Otp.findOne({ email, code: otp, verified: false });
  if (!otpDoc) {
    throw new AuthenticationError("Invalid OTP");
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new AuthenticationError("OTP expired");
  }

  // Mark OTP as verified
  otpDoc.verified = true;
  await otpDoc.save();

  // Hash password with proper salt rounds
  const hash = await bcrypt.hash(password, 12);

  // Create user
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

  // Issue JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  logger.info("User signup completed", { email, role, userId: user._id });

  res.status(201).json({
    message: "Signup successful.",
    token,
    user: { id: user._id, email: user.email, role: user.role },
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token || typeof token !== 'string') {
    throw new ValidationError("Invalid verification token");
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new AuthenticationError("Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  logger.info("Email verified", { email: user.email, userId: user._id });

  res.json({ message: "Email verified. You can now login." });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Validate inputs
  const validation = validateLoginRequest({ email, password, role });
  if (!validation.isValid) {
    throw new ValidationError("Validation failed", validation.errors);
  }

  // Check if user exists
  const user = await User.findOne({ email, role });
  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new AuthenticationError("Email not verified. Please verify your email first.");
  }

  // Compare passwords
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  logger.info("User login successful", { email, role, userId: user._id });

  res.json({
    token,
    user: { id: user._id, email: user.email, role: user.role },
  });
});
