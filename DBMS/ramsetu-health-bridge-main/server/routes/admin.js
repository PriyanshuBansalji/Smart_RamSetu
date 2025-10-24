import express from "express";
import User from "../models/User.js";
import Document from "../models/Document.js";
import Match from "../models/Match.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get all users (donors/patients)
router.get("/users", authenticate, authorize(["admin"]), async (req, res) => {
  const users = await User.find({ role: { $in: ["donor", "patient"] } }).select("-password -verificationToken");
  res.json(users);
});

// Get all documents
router.get("/documents", authenticate, authorize(["admin"]), async (req, res) => {
  const docs = await Document.find().populate("user", "email role name");
  res.json(docs);
});

// Approve/reject document
router.put("/documents/:id", authenticate, authorize(["admin"]), async (req, res) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(doc);
});

// Get statistics
router.get("/stats", authenticate, authorize(["admin"]), async (req, res) => {
  const donors = await User.countDocuments({ role: "donor" });
  const patients = await User.countDocuments({ role: "patient" });
  const matches = await Match.countDocuments({ status: "approved" });
  res.json({ donors, patients, matches });
});

export default router;
