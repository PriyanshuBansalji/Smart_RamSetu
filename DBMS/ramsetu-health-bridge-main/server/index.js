import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

import donorRoutes from "./routes/donor.js";
import patientRoutes from "./routes/patient.js";


import contactRoutes from "./routes/contact.js";
import feedbackRoutes from "./routes/feedback.js";
import adminRoutes from "./routes/admin.js";
import matchRoutes from "./routes/match.js";
import donationRequestRoutes from "./routes/donationRequest.js";
import documentRoutes from "./routes/document.js";

console.log("EMAIL_USER:", process.env.EMAIL_USER, "EMAIL_PASS:", process.env.EMAIL_PASS);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

app.get("/", (req, res) => {
  res.send("RamSetu Health Bridge Backend Running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/donation-request", donationRequestRoutes);
app.use("/api/document", documentRoutes);

app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);

// MongoDB connection (update URI as needed)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ramsetu-health-bridge";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});
