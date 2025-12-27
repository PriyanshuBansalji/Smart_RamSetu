import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import multer from "multer";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import PatientRequest from "../models/PatientRequest.js";
import axios from "axios";

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

// Serve patient profile image by patient id or userId
router.get("/profile-image/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let patient = null;
    // Try by Patient document id first
    try {
      patient = await Patient.findById(id);
    } catch {}
    // Fallback: try by userId
    if (!patient) {
      patient = await Patient.findOne({ userId: id });
    }
    if (!patient || !patient.profileImage || !patient.profileImage.data) {
      return res.status(404).send("No profile image found");
    }
    res.set("Content-Type", patient.profileImage.contentType || "image/png");
    res.send(patient.profileImage.data);
  } catch (err) {
    res.status(500).send("Error retrieving image");
  }
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

// Patient applies for organ: store request and trigger ML matching
router.post("/request/:organ", authenticate, async (req, res) => {
  try {
    const patientId = req.user._id;
    const organRaw = req.params.organ;
    const organ = String(organRaw).trim().toLowerCase();
    const { tests, consent } = req.body;
    console.log("[ML] Patient organ request received", { patientId, organ });

    if (!organ) {
      return res.status(400).json({ error: "Organ is required" });
    }
    if (!Array.isArray(tests)) {
      return res.status(400).json({ error: "Tests array required" });
    }

    // 1. Store patient request in the database
    let patientRequest = await PatientRequest.create({
      patient: patientId,
      organ,
      tests,
      consent: !!consent,
      status: "Pending",
    });

    let matchScore = null;
    let matchDonorId = null;
    let rankedMatches = [];
    let mlError = null;
    try {
      // Fetch patient data
      const patientUser = await User.findById(patientId).lean();
      if (!patientUser || patientUser.role !== "patient") throw new Error("Patient not found");
      let patientProfile = patientUser.patientProfile || {};
      let patientBG = (patientUser.bloodGroup || patientProfile.bloodGroup || '').toString().trim().toUpperCase();
      // If not found in User, try Patient collection
      if (!patientBG) {
        const PatientModel = (await import('../models/Patient.js')).default;
        const patientDoc = await PatientModel.findOne({ userId: patientId }).lean();
        if (patientDoc && patientDoc.bloodGroup) {
          patientBG = patientDoc.bloodGroup.toString().trim().toUpperCase();
        }
        if (patientDoc && patientDoc.profileImage && patientDoc.profileImage.bloodGroup) {
          patientBG = patientDoc.profileImage.bloodGroup.toString().trim().toUpperCase();
        }
        // Use patientDoc as profile fallback
        if (patientDoc) patientProfile = { ...patientProfile, ...patientDoc };
      }

      // Validate patient location
      const patientLat = patientProfile.lat;
      const patientLon = patientProfile.lon;
      if (typeof patientLat !== 'number' || typeof patientLon !== 'number') {
        console.warn('[ML] Patient location missing, using fallback distance');
      }

      // Fetch all verified donation requests for this organ
      let DonationRequestModule = await import('../models/DonationRequest.js');
      const DonationRequest = DonationRequestModule.default || DonationRequestModule.DonationRequest || DonationRequestModule;
      const verifiedDonations = await DonationRequest.find({
        organ: { $regex: new RegExp('^' + organ + '$', 'i') },
        status: 'Verified'
      }).lean();
      console.log(`[ML] Verified donors found: ${verifiedDonations.length}`);

      // For each verified donation, fetch the donor's User profile (case-insensitive, robust)
      const eligibleDonors = [];
      for (const donation of verifiedDonations) {
        if (!donation.donor) continue;
        let donorUser = await User.findById(donation.donor).lean();
        let donorBG = '';
        // Try to get blood group from User top-level or donorProfile
        if (donorUser) {
          donorBG = (donorUser.bloodGroup || donorUser.donorProfile?.bloodGroup || '').toString().trim().toUpperCase();
        }
        // If still missing, try to get from donors collection
        if (!donorBG) {
          const DonorModel = (await import('../models/Donor.js')).default;
          const donorDoc = await DonorModel.findOne({ userId: donation.donor }).lean();
          if (donorDoc && donorDoc.bloodGroup) {
            donorBG = donorDoc.bloodGroup.toString().trim().toUpperCase();
          }
        }
        // Use patientBG variable fetched before the loop
        console.log('[ML] Donor blood group:', donorBG, '| Patient blood group:', patientBG, '| Donor userId:', donorUser?._id || donation.donor);
        // Medical eligibility: blood group match (case-insensitive)
        if (!donorBG || !patientBG || donorBG !== patientBG) continue;
        // Add more eligibility checks as needed
        eligibleDonors.push({
          donorUser,
          donationId: donation._id,
          donorBG
        });
      }
      console.log(`[ML] Eligible donors: ${eligibleDonors.length}`);

      // Build ML feature vectors for all organs
      function calcDistanceKm(lat1, lon1, lat2, lon2) {
        if (
          typeof lat1 === 'number' && typeof lon1 === 'number' &&
          typeof lat2 === 'number' && typeof lon2 === 'number'
        ) {
          // Haversine formula
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return Math.round(R * c);
        }
        // fallback: 0 if same city, 100 otherwise
        return 100;
      }
      const urgency = 3; // or get from doctor/tests
      const features = eligibleDonors.map(({ donorUser }) => {
        const donorProfile = donorUser.donorProfile || {};
        let feature = {};
        if (organ === 'kidney') {
          feature = {
            hla_score: donorProfile.hla_score ?? 0.8,
            renal_score: donorProfile.renal_score ?? 0.8,
            imaging_score: donorProfile.imaging_score ?? 0.8,
            cardiac_score: donorProfile.cardiac_score ?? 0.8,
            distance_km: calcDistanceKm(
              patientProfile.lat, patientProfile.lon,
              donorProfile.lat, donorProfile.lon
            ),
            urgency_level: urgency
          };
        } else if (organ === 'cornea') {
          feature = {
            infection_score: donorProfile.infection_score ?? 0.8,
            eye_health_score: donorProfile.eye_health_score ?? 0.8,
            serology_score: donorProfile.serology_score ?? 0.8,
            distance_km: calcDistanceKm(
              patientProfile.lat, patientProfile.lon,
              donorProfile.lat, donorProfile.lon
            ),
            urgency_level: urgency
          };
        } else if (organ === 'heart') {
          feature = {
            blood_compat_score: donorProfile.blood_compat_score ?? 0.8,
            echo_score: donorProfile.echo_score ?? 0.8,
            angiography_score: donorProfile.angiography_score ?? 0.8,
            viral_score: donorProfile.viral_score ?? 0.8,
            cardiac_risk_score: donorProfile.cardiac_risk_score ?? 0.8,
            distance_km: calcDistanceKm(
              patientProfile.lat, patientProfile.lon,
              donorProfile.lat, donorProfile.lon
            ),
            urgency_level: urgency
          };
        } else if (organ === 'liver') {
          feature = {
            blood_compat_score: donorProfile.blood_compat_score ?? 0.8,
            liver_function_score: donorProfile.liver_function_score ?? 0.8,
            imaging_score: donorProfile.imaging_score ?? 0.8,
            viral_score: donorProfile.viral_score ?? 0.8,
            coagulation_score: donorProfile.coagulation_score ?? 0.8,
            distance_km: calcDistanceKm(
              patientProfile.lat, patientProfile.lon,
              donorProfile.lat, donorProfile.lon
            ),
            urgency_level: urgency
          };
        } else {
          // fallback: kidney features
          feature = {
            hla_score: donorProfile.hla_score ?? 0.8,
            renal_score: donorProfile.renal_score ?? 0.8,
            imaging_score: donorProfile.imaging_score ?? 0.8,
            cardiac_score: donorProfile.cardiac_score ?? 0.8,
            distance_km: 0,
            urgency_level: urgency
          };
        }
        return feature;
      });
      console.log(`[ML] Features:`, features);

      if (features.length === 0) {
        patientRequest.status = 'NoMatch';
        await patientRequest.save();
        return res.status(200).json({
          patientRequest,
          matchScore: null,
          message: "No eligible donors found. No match possible."
        });
      }

      // Call ML module directly with timeout
      try {
        console.log('[ML] Sending request to ML module...');
        const mlRes = await axios.post('http://localhost:8000/predict_and_rank', {
          organ,
          donor_patient_data: features
        }, { timeout: 30000 });
        console.log('[ML] ML module response:', mlRes.data);
        const mlResponse = mlRes.data;
        // Expecting array of objects with predicted_match_score
        if (Array.isArray(mlResponse) && mlResponse.length === eligibleDonors.length) {
          rankedMatches = eligibleDonors.map((d, i) => ({
            donorId: d.donorUser._id,
            score: mlResponse[i].predicted_match_score,
            donorProfile: d.donorUser.donorProfile,
            donorName: d.donorUser.fullName || d.donorUser.donorProfile?.fullName || nameFromEmail(d.donorUser.email),
            donorEmail: d.donorUser.email,
            donorCity: d.donorUser.donorProfile?.city || '',
            donorState: d.donorUser.donorProfile?.state || '',
            donorBloodGroup: d.donorBG
          })).sort((a, b) => b.score - a.score);
          if (rankedMatches.length > 0) {
            matchScore = rankedMatches[0].score;
            matchDonorId = rankedMatches[0].donorId;
            patientRequest.matchScore = matchScore;
            patientRequest.matchDonor = matchDonorId;
            patientRequest.status = 'Matched';
            await patientRequest.save();
          } else {
            patientRequest.status = 'NoMatch';
            await patientRequest.save();
          }
        } else {
          patientRequest.status = 'MLFailed';
          patientRequest.mlError = 'Invalid ML response';
          await patientRequest.save();
        }
      } catch (mlErr) {
        mlError = mlErr?.message || mlErr;
        patientRequest.status = 'MLFailed';
        patientRequest.mlError = mlError;
        await patientRequest.save();
        console.error("[ML] Error calling ML service:", mlErr);
      }
    } catch (mlErr) {
      mlError = mlErr?.message || mlErr;
      patientRequest.status = 'Error';
      patientRequest.mlError = mlError;
      await patientRequest.save();
      console.error("[ML] Data preparation or matching error:", mlError);
    }

    // Prepare best match donor info with full details for frontend
    let bestMatchDonor = null;
    if (rankedMatches.length > 0) {
      const best = rankedMatches[0];
      bestMatchDonor = {
        donorId: best.donorId,
        name: best.donorName,
        email: best.donorEmail,
        city: best.donorCity,
        state: best.donorState,
        bloodGroup: best.donorBloodGroup,
        matchScore: best.score,
        matchPercentage: Math.round(best.score * 100)
      };
      // Save best match donor to patientRequest
      patientRequest.bestMatchDonor = bestMatchDonor;
      await patientRequest.save();
    }

    // Only return top 3 matches for frontend display
    const topRankedMatches = Array.isArray(rankedMatches) ? rankedMatches.slice(0, 3).map(m => ({
      donorId: m.donorId,
      name: m.donorName,
      city: m.donorCity,
      state: m.donorState,
      bloodGroup: m.donorBloodGroup,
      matchScore: m.score,
      matchPercentage: Math.round(m.score * 100)
    })) : [];
    
    res.status(201).json({
      patientRequest,
      matchScore,
      matchDonorId,
      bestMatchDonor,
      rankedMatches: topRankedMatches,
      mlError
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Patient: list my patient requests
router.get('/request/my', authenticate, authorize(['patient']), async (req, res) => {
  try {
    const list = await PatientRequest.find({ patient: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});


// Fetch verified donation requests for a specific organ
router.get('/donor-verified/:organ', async (req, res) => {
  try {
    const organ = req.params.organ;
    // Find all verified donation requests for the given organ
    let DonationRequestModule = await import('../models/DonationRequest.js');
    const DonationRequest = DonationRequestModule.default || DonationRequestModule.DonationRequest || DonationRequestModule;
    const verifiedDonations = await DonationRequest.find({
      organ: { $regex: new RegExp('^' + organ + '$', 'i') },
      status: 'Verified'
    }).lean();
    res.json(verifiedDonations);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
