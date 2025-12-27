import express from "express";
import { authenticate } from "../middleware/auth.js";
import multer from "multer";
import Donor from "../models/Donor.js";
import User from "../models/User.js";
import DonationRequest from "../models/DonationRequest.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Flexible: Get donor profile by userId or email
router.get("/profile", authenticate, async (req, res) => {
  try {
    let userId = req.user?._id;
    let email = req.user?.email;
    let donor = null;

    // Try by userId first
    if (userId) {
      donor = await Donor.findOne({ userId });
    }
    // Fallback: fetch user and try by email
    if (!donor && email) {
      donor = await Donor.findOne({ email });
    }
    // Fallback: fetch user from User model
    let userDoc = null;
    if (!donor && userId) {
      userDoc = await User.findById(userId).select("email fullName name");
      if (userDoc?.email) {
        donor = await Donor.findOne({ email: userDoc.email });
        email = userDoc.email;
      }
    }

    // --- Improved auto-create donor if not found ---
    if (!donor && userId && email) {
      if (!userDoc) {
        userDoc = await User.findById(userId).select("email fullName name");
      }
      donor = await Donor.create({
        userId,
        email,
        fullName: userDoc?.fullName || userDoc?.name || "",
      });
    }
    // ------------------------------------------------

    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }

    // Attach requests to donor profile object
    const requests = await DonationRequest.find({ donor: userId }).sort({ createdAt: -1 });
    const donorObj = donor.toObject();
    donorObj.requests = requests;

    res.json(donorObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flexible: Get donor requests by userId or email
router.get("/requests", authenticate, async (req, res) => {
  try {
    let userId = req.user?._id;
    let email = req.user?.email;
    let requests = [];

    // Try by userId first
    if (userId) {
      requests = await DonationRequest.find({ donor: userId }).sort({ createdAt: -1 });
    }
    // Fallback: fetch user and try by email
    if ((!requests || requests.length === 0) && email) {
      requests = await DonationRequest.find({ email }).sort({ createdAt: -1 });
    }
    // Fallback: fetch user from User model
    if ((!requests || requests.length === 0) && userId) {
      const userDoc = await User.findById(userId).select("email");
      if (userDoc?.email) {
        requests = await DonationRequest.find({ email: userDoc.email }).sort({ createdAt: -1 });
      }
    }

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all verified donations (for patients to view available donors)
router.get("/donations", async (req, res) => {
  try {
    // Get all verified donation requests, sorted by donor and createdAt
    const donations = await DonationRequest.find({ status: "Verified" })
      .populate("donor", "fullName name email city state bloodGroup")
      .sort({ "donor": 1, "createdAt": -1 });
    
    // Group donations by donor userId - use a simple object map
    const donorMap = new Map();
    
    // Process each donation request
    for (const d of donations) {
      const userId = d.donor?._id?.toString() || "unknown";
      
      // If this is a new donor, initialize their entry
      if (!donorMap.has(userId)) {
        let donorInfo = {
          fullName: d.donor?.fullName,
          name: d.donor?.name,
          email: d.donor?.email || d.email,
          city: d.donor?.city,
          state: d.donor?.state,
          bloodGroup: d.donor?.bloodGroup
        };

        // If donor info is incomplete, try to fetch from Donor collection
        if (!donorInfo.fullName || !donorInfo.city) {
          try {
            const donorProfile = await Donor.findOne({ userId }).select("fullName name city state bloodGroup email");
            if (donorProfile) {
              donorInfo = {
                fullName: donorProfile.fullName || donorInfo.fullName,
                name: donorProfile.name || donorInfo.name,
                email: donorProfile.email || donorInfo.email,
                city: donorProfile.city || donorInfo.city,
                state: donorProfile.state || donorInfo.state,
                bloodGroup: donorProfile.bloodGroup || donorInfo.bloodGroup
              };
            }
          } catch (e) {
            // Ignore Donor lookup errors
          }
        }

        donorMap.set(userId, {
          _id: userId,
          userId,
          ...donorInfo,
          organs: [],
          donations: [],
          status: "Verified",
          createdAt: d.createdAt
        });
      }

      // Get the donor entry
      const donorEntry = donorMap.get(userId);
      
      // Add organ if not already present
      if (!donorEntry.organs.includes(d.organ)) {
        donorEntry.organs.push(d.organ);
      }
      
      // Track the donation record
      donorEntry.donations.push({
        requestId: d._id.toString(),
        organ: d.organ
      });
    }

    // Convert map to array
    const result = Array.from(donorMap.values());

    res.json(result);
  } catch (err) {
    console.error("Error in /donations endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create or update donor profile
router.put("/profile", authenticate, upload.any(), async (req, res) => {
  try {
    // Debug log for user id
    console.log("PUT /api/donor/profile for user:", req.user?._id);
    const update = { ...req.body, userId: req.user._id };
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
        if (file.fieldname === "govId") {
          update.govId = {
            data: file.buffer,
            contentType: file.mimetype,
          };
        }
        // Add more fields if needed
      }
    }
    // Validate required fields (example: email)
    if (!update.email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Try update/create
    let donor;
    try {
      donor = await Donor.findOneAndUpdate(
        { userId: req.user._id },
        update,
        { new: true, upsert: true }
      );
    } catch (err) {
      // Handle duplicate key or validation errors with clarity and a one-time retry for regId
      if (err.code === 11000) {
        const key = (err.keyPattern && Object.keys(err.keyPattern)[0]) || (err.keyValue && Object.keys(err.keyValue)[0]);
        if (key === 'regId') {
          // regenerate regId and retry once
          const regenerated = `DON-${Date.now()}-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
          try {
            donor = await Donor.findOneAndUpdate(
              { userId: req.user._id },
              { ...update, regId: regenerated },
              { new: true, upsert: true }
            );
            return res.json(donor);
          } catch (e2) {
            return res.status(400).json({ error: "Registration ID already exists. Please resubmit the form.", details: e2.message });
          }
        }
        const field = key || 'field';
        return res.status(400).json({ error: `Duplicate value for ${field}.`, field, details: err.message });
      }
      return res.status(500).json({ error: err.message || "Database error" });
    }
    if (!donor) {
      return res.status(500).json({ error: "Failed to save donor profile" });
    }
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Get donor email for logged-in user
router.get("/email", authenticate, async (req, res) => {
  let donor = await Donor.findOne({ userId: req.user._id });
  try {
    if (!donor) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: "User not found" });
      donor = await Donor.create({ userId: req.user._id, email: user.email });
    }
    res.json({ email: donor.email });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Get all donor profiles (dashboard/admin)
router.get("/all", async (req, res) => {
  try {
    const donors = await Donor.find({}).sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donor by userId or donorId (for dashboard)
router.get("/by-id/:id", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ error: "Donor not found" });
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donation requests by donor userId (for dashboard or admin)
router.get("/requests/by-donor/:id", authenticate, async (req, res) => {
  try {
    const requests = await DonationRequest.find({ donor: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donor by email (for dashboard)
router.get("/by-email/:email", async (req, res) => {
  try {
    const donor = await Donor.findOne({ email: req.params.email });
    if (!donor) return res.status(404).json({ error: "Donor not found" });
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve donor profile image by donor id
router.get("/profile-image/:id", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor || !donor.profileImage || !donor.profileImage.data) {
      return res.status(404).send("No profile image found");
    }
    res.set("Content-Type", donor.profileImage.contentType || "image/png");
    res.send(donor.profileImage.data);
  } catch (err) {
    res.status(500).send("Error retrieving image");
  }
});

// Health check endpoint for backend and DB connectivity
router.get("/health", async (req, res) => {
  try {
    // Try a simple DB operation
    await Donor.findOne().select("_id").lean();
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected", error: err.message });
  }
});

export default router;
