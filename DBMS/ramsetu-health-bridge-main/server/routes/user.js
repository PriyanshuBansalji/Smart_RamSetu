
import express from "express";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Update user profile (accepts any file field, but only processes profileImage and signature)
router.put("/me", authenticate, upload.any(), async (req, res) => {
  try {
    // Build update object from form fields
    const update = { ...req.body };

    // Attach file buffers for profileImage and signature only
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === "profileImage") {
          update.profileImage = {
            data: file.buffer,
            contentType: file.mimetype,
          };
        }
        if (file.fieldname === "signature") {
          update.signature = {
            data: file.buffer,
            contentType: file.mimetype,
          };
        }
        // Ignore all other file fields (e.g. govId)
      }
    }

    // Update user in DB
    const user = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true }
    ).select("-password -verificationToken");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
});

// Get current user profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verificationToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch user" });
  }
});

// Get user by ID
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -verificationToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin/dashboard)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -verificationToken")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
