import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { errorHandler, logger } from "./utils/errorHandler.js";

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

const app = express();
const PORT = process.env.PORT || 5000;

// Flexible CORS configuration using environment variables
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      "http://localhost:8081", 
      "http://localhost:8080",
      "http://localhost:5173",
      "https://ramsetu-health-bridge-83g2d2ca.vercel.app",
      "https://ramsetu-admin-3dt6uxggc-priyanshujibansal-1166s-projects.vercel.app"
    ];

logger.info("Server starting", { port: PORT, nodeEnv: process.env.NODE_ENV });
logger.info("Allowed CORS Origins", { origins: allowedOrigins });

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "RamSetu Health Bridge Backend Running", timestamp: new Date().toISOString() });
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

// 404 handler
app.use((req, res) => {
  logger.warn("404 Not found", { path: req.path, method: req.method });
  res.status(404).json({ error: "Endpoint not found", statusCode: 404 });
});

// Global error handler (must be last)
app.use(errorHandler);

// MongoDB connection with better error handling
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ramsetu-health-bridge";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info("MongoDB connected successfully");
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  logger.error("MongoDB connection error", { error: err.message, uri: MONGO_URI });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
  process.exit(1);
});
