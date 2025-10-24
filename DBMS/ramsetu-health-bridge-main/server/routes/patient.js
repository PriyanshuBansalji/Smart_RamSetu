import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import multer from "multer";
import Patient from "../models/Patient.js";
import User from "../models/User.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Utility: derive a pretty name from email local-part
function nameFromEmail(email) {
  if (!email) return "";
  try {
    const local = String(email).split("@")[0] || "";
    const pretty = local
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return pretty || "";
  } catch {
    return "";
  }
}

// Create or update patient profile
router.put("/profile", authenticate, upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "govId", maxCount: 1 },
]), async (req, res) => {
  const update = { ...req.body, userId: req.user.id };
  if (req.files && req.files.profileImage) {
    update.profileImage = {
      data: req.files.profileImage[0].buffer,
      contentType: req.files.profileImage[0].mimetype,
    };
  }
  if (req.files && req.files.govId) {
    update.govId = {
      data: req.files.govId[0].buffer,
      contentType: req.files.govId[0].mimetype,
    };
  }
  const patient = await Patient.findOneAndUpdate(
    { userId: req.user.id },
    update,
    { new: true, upsert: true }
  );
  res.json(patient);
});

// Get patient profile
router.get("/profile", authenticate, async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  res.json(patient);
});

// Get all patients (for admin panel)
router.get("/all", async (req, res) => {
  try {
    // Pull from Patient collection first
    const patientsDocs = await Patient.find()
      .select("_id userId fullName email bloodGroup city state country contact")
      .lean();
    const patientsFromPatients = (patientsDocs || []).map(p => ({
      _id: p._id,
      userId: String(p.userId || p._id),
      email: p.email || "",
      name: p.fullName || nameFromEmail(p.email),
      bloodGroup: p.bloodGroup || "",
      city: p.city || "",
      state: p.state || "",
      country: p.country || "",
      contact: p.contact || "",
      source: "Patient"
    }));

    // Also include any Users with role=patient that don't already have a Patient doc
    const existingUserIds = new Set(patientsFromPatients.map(p => String(p.userId)));
    const users = await User.find({ role: "patient" })
      .select("_id email patientProfile")
      .lean();
    const patientsFromUsers = (users || [])
      .filter(u => !existingUserIds.has(String(u._id)))
      .map(u => ({
        _id: u._id,
        userId: String(u._id),
        email: u.email || "",
        name: u.patientProfile?.fullName || nameFromEmail(u.email),
        bloodGroup: u.patientProfile?.bloodGroup || "",
        city: u.patientProfile?.city || "",
        state: u.patientProfile?.state || "",
        country: u.patientProfile?.country || "",
        contact: u.patientProfile?.contact || "",
        source: "User"
      }));

    res.json([...patientsFromPatients, ...patientsFromUsers]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Get a single patient record by userId (admin view helper)
router.get("/by-user/:userId", async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId }).lean();
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// Get a normalized patient details view by userId (merges User + Patient)
// Public normalized details (admin UI can call this without token in dev)
router.get("/details/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [userDoc, patientDoc] = await Promise.all([
      User.findById(userId).lean(),
      Patient.findOne({ userId }).lean(),
    ]);

    if (!userDoc && !patientDoc) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const u = userDoc || {};
    const p = patientDoc || {};
    const pp = (u.patientProfile || {});

    const email = u.email || p.email || '';
    const name = pp.fullName || p.fullName || (u.donorProfile?.fullName) || nameFromEmail(email);
    const bloodGroup = pp.bloodGroup || p.bloodGroup || '';
    const phone = pp.contact || p.contact || u.contact || u.phone || '';
    const gender = pp.gender || p.gender || '';
    const dob = pp.dob || p.dob || '';
    const city = pp.city || p.city || '';
    const state = pp.state || p.state || '';
    const country = pp.country || p.country || '';
    const emergencyContact = pp.emergencyContact || p.emergencyContact || '';
    const kinConsent = (pp.kinConsent ?? p.kinConsent) ?? false;
    const regId = pp.regId || p.regId || '';
    const regDate = pp.regDate || p.regDate || '';
    const regPlace = pp.regPlace || p.regPlace || '';
    const address = pp.address || p.address || '';

    res.json({
      userId,
      role: u.role || 'patient',
      name,
      email,
      bloodGroup,
      phone,
      gender,
      dob,
      city,
      state,
      country,
      emergencyContact,
      kinConsent,
      regId,
      regDate,
      regPlace,
      address,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch normalized patient details" });
  }
});

// Admin: create/update a patient's profile by userId
router.put("/admin/:userId", authenticate, authorize("admin"), async (req, res) => {
  try {
    const userId = req.params.userId;
    const allowed = [
      "fullName","dob","gender","bloodGroup","address","city","state","country",
      "contact","email","emergencyContact","kinConsent","regId","regDate","regPlace"
    ];
    const update = { userId };
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];
    const patient = await Patient.findOneAndUpdate(
      { userId },
      update,
      { new: true, upsert: true }
    ).lean();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to save patient profile" });
  }
});

export default router;
