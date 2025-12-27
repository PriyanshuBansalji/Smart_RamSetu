import express from "express";
const router = express.Router();
import axios from 'axios';
import { asyncHandler, ValidationError, NotFoundError, logger } from '../utils/errorHandler.js';
import { validateOrgan, validateObjectId } from '../utils/validation.js';

// Helper: Calculate distance (Haversine formula, dummy for now)
function calcDistanceKm(lat1, lon1, lat2, lon2) {
  // TODO: Use real coordinates; for now, return a random value
  return Math.round(Math.random() * 500);
}

// Helper function for building feature vectors based on organ type
function buildFeatureVectors(organ, donors, patientProfile, urgency) {
  return donors.map(donor => {
    const donorProfile = donor.donorProfile || {};
    const organLower = organ.toLowerCase();

    const baseDistance = calcDistanceKm(
      patientProfile.lat, patientProfile.lon,
      donorProfile.lat, donorProfile.lon
    );

    const baseObject = {
      distance_km: baseDistance,
      urgency_level: urgency
    };

    switch (organLower) {
      case 'kidney':
        return {
          ...baseObject,
          hla_score: donorProfile.hla_score ?? 0.8,
          renal_score: donorProfile.renal_score ?? 0.8,
          imaging_score: donorProfile.imaging_score ?? 0.8,
          cardiac_score: donorProfile.cardiac_score ?? 0.8,
        };
      case 'cornea':
        return {
          ...baseObject,
          infection_score: donorProfile.infection_score ?? 0.8,
          eye_health_score: donorProfile.eye_health_score ?? 0.8,
          serology_score: donorProfile.serology_score ?? 0.8,
        };
      case 'heart':
        return {
          ...baseObject,
          blood_compat_score: donorProfile.blood_compat_score ?? 0.8,
          echo_score: donorProfile.echo_score ?? 0.8,
          angiography_score: donorProfile.angiography_score ?? 0.8,
          viral_score: donorProfile.viral_score ?? 0.8,
          cardiac_risk_score: donorProfile.cardiac_risk_score ?? 0.8,
        };
      case 'liver':
        return {
          ...baseObject,
          blood_compat_score: donorProfile.blood_compat_score ?? 0.8,
          liver_function_score: donorProfile.liver_function_score ?? 0.8,
          imaging_score: donorProfile.imaging_score ?? 0.8,
          viral_score: donorProfile.viral_score ?? 0.8,
          coagulation_score: donorProfile.coagulation_score ?? 0.8,
        };
      default:
        return baseObject;
    }
  });
}

// Helper function for blood group compatibility
function isBloodGroupCompatible(donorBg, patientBg) {
  if (!donorBg || !patientBg) return true; // Unknown groups are assumed compatible
  
  // Simplified ABO and Rh compatibility logic
  const compatibilityMatrix = {
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
  };

  return compatibilityMatrix[donorBg]?.includes(patientBg) ?? true;
}

/**
 * Smart matching endpoint with ML integration
 */
router.post('/smart/:patientId/:organ', authenticate, authorize(["admin", "patient"]), asyncHandler(async (req, res) => {
  const { patientId, organ } = req.params;

  // Validate inputs
  if (!validateObjectId(patientId)) {
    throw new ValidationError("Invalid patient ID");
  }

  if (!validateOrgan(organ)) {
    throw new ValidationError("Invalid organ type");
  }

  // 1. Fetch patient
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== "patient") {
    throw new NotFoundError("Patient not found");
  }

  const patientProfile = patient.patientProfile || {};

  // 2. Fetch verified donors for this organ
  const donors = await User.find({
    role: "donor",
    organ,
    isVerified: true
  }).select('_id bloodGroup donorProfile email fullName name');

  if (donors.length === 0) {
    logger.info("No eligible donors found", { patientId, organ });
    return res.json({ patientId, organ, ranked: [] });
  }

  // 3. Rule-based filtering
  const eligibleDonors = donors.filter(donor => {
    const donorBg = donor.donorProfile?.bloodGroup || donor.bloodGroup;
    const patientBg = patient.patientProfile?.bloodGroup || patient.bloodGroup;
    // Basic blood group matching
    return !donorBg || !patientBg || isBloodGroupCompatible(donorBg, patientBg);
  });

  if (eligibleDonors.length === 0) {
    logger.info("No blood group compatible donors", { patientId, organ });
    return res.json({ patientId, organ, ranked: [] });
  }

  // 4. Build ML feature vectors
  const urgency = req.body.urgency_level || 3;
  const features = buildFeatureVectors(organ, eligibleDonors, patientProfile, urgency);

  // 5. Call ML service with error handling
  let scores = [];
  try {
    const mlRes = await axios.post(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict`, {
      organ: organ.toLowerCase(),
      features
    }, { timeout: 30000 });

    scores = mlRes.data.match_scores || [];
    logger.info("ML service returned scores", { patientId, organ, scoreCount: scores.length });
  } catch (mlErr) {
    logger.warn("ML service error, using default scores", { organ, error: mlErr.message });
    scores = Array(eligibleDonors.length).fill(0.5); // Default fallback score
  }

  // 6. Rank and store matches
  const ranked = eligibleDonors.map((donor, i) => ({
    donorId: donor._id,
    name: donor.fullName || donor.name,
    email: donor.email,
    bloodGroup: donor.bloodGroup || donor.donorProfile?.bloodGroup,
    match_score: scores[i] || 0.5,
  })).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  // Store top matches in DB
  const topN = 5;
  for (let i = 0; i < Math.min(topN, ranked.length); i++) {
    const donorId = ranked[i].donorId;
    const existing = await Match.findOne({ patient: patientId, donor: donorId, organ, status: 'pending' });
    if (!existing) {
      await Match.create({ patient: patientId, donor: donorId, organ, status: 'pending' });
    }
  }

  logger.info("Smart match completed", { patientId, organ, matchCount: ranked.length });
  res.json({ patientId, organ, ranked });
}));

import User from "../models/User.js";
import Match from "../models/Match.js";
import DonationRequest from "../models/DonationRequest.js";
import { authenticate, authorize } from "../middleware/auth.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();



// Mail transporter
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// Find compatible donors for a patient
router.get("/suggest/:patientId", authenticate, authorize(["admin"]), async (req, res) => {
  const patient = await User.findById(req.params.patientId);
  if (!patient || patient.role !== "patient") return res.status(404).json({ message: "Patient not found" });
  const donors = await User.find({
    role: "donor",
    organ: patient.requiredOrgan,
    bloodGroup: patient.bloodGroup,
    isVerified: true,
  });
  res.json(donors);
});

// Patient sends a match request for a donor organ
router.post('/request', authenticate, authorize(["patient"]), async (req, res) => {
  try {
    const patientId = req.user._id;
    const { donorId, organ } = req.body || {};
    if (!donorId || !organ) return res.status(400).json({ error: 'donorId and organ are required' });

    // Upsert a pending match (avoid duplicate pending requests)
    const existing = await Match.findOne({ patient: patientId, donor: donorId, organ, status: 'pending' });
    if (existing) return res.status(200).json(existing);

    const match = await Match.create({ patient: patientId, donor: donorId, organ, status: 'pending' });

    // Send emails asynchronously (fire-and-forget)
    (async () => {
      try {
        const patient = await User.findById(patientId).select('email name fullName bloodGroup');
        const donor = await User.findById(donorId).select('email name fullName donorProfile');
        
        // 1. Notify patient - confirmation of request submission
        const patientSubject = `✓ Your ${organ} Match Request Submitted`;
        const patientHtml = `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.5">
            <h2 style="color:#059669">🎯 Match Request Submitted Successfully</h2>
            <p>Dear ${(patient?.fullName||patient?.name||'Patient')},</p>
            <p>Your organ match request has been submitted to our admin team for verification and approval.</p>
            <div style="margin:16px 0;padding:12px;border-left:4px solid #059669;background:#f0fdf4">
              <p style="margin:0"><b>Request Details:</b></p>
              <ul style="margin:8px 0;padding-left:20px">
                <li><b>Organ Required:</b> ${organ}</li>
                <li><b>Status:</b> Pending Admin Verification</li>
                <li><b>Submitted On:</b> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</li>
              </ul>
            </div>
            <p><b>What's Next?</b></p>
            <ol>
              <li>Our admin team will review the match compatibility within 24 hours</li>
              <li>We'll verify medical tests and blood group compatibility</li>
              <li>You'll receive an email notification once the request is approved or requires more information</li>
            </ol>
            <p style="color:#666;font-size:13px;margin-top:16px">Need help? Contact our support team at your earliest convenience.</p>
            <p style="margin-top:16px">Regards,<br/><b>RamSetu Health Bridge Team</b></p>
          </div>
        `;
        if (patient?.email) {
          await mailTransporter.sendMail({ from: process.env.EMAIL_USER, to: patient.email, subject: patientSubject, html: patientHtml });
        }

        // 2. Notify admin - new match request
        const adminSubject = `[URGENT] New Organ Match Request - ${organ}`;
        const adminHtml = `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.5">
            <h2 style="color:#dc2626">🔴 New Match Request for Admin Review</h2>
            <p>A new patient organ match request requires your immediate review.</p>
            <div style="margin:16px 0;padding:12px;border:1px solid #fecaca;background:#fef2f2">
              <p style="margin:0"><b>Match Details:</b></p>
              <ul style="margin:8px 0;padding-left:20px">
                <li><b>Organ:</b> ${organ}</li>
                <li><b>Patient:</b> ${(patient?.fullName||patient?.name||'Unknown')} (${patient?.email||'N/A'})</li>
                <li><b>Patient Blood Group:</b> ${patient?.bloodGroup||'Not Specified'}</li>
                <li><b>Donor:</b> ${(donor?.fullName||donor?.name||'Unknown')} (${donor?.email||'N/A'})</li>
              </ul>
            </div>
            <p style="color:#dc2626"><b>ACTION REQUIRED:</b> Please log into the admin panel to review and approve/reject this match.</p>
            <p style="margin-top:16px">Regards,<br/>RamSetu System</p>
          </div>
        `;
        if (ADMIN_EMAIL) {
          await mailTransporter.sendMail({ from: process.env.EMAIL_USER, to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });
        }
      } catch (e) { console.error('Failed to send match request emails:', e?.message||e); }
    })();

    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Patient: list my match requests
router.get('/my', authenticate, authorize(["patient"]), async (req, res) => {
  // Return matches for this patient, enriched with donor and patient summaries for UI convenience
  const list = await Match.find({ patient: req.user._id }).sort({ updatedAt: -1 }).lean();

  // Collect unique donor and patient ids
  const donorIds = Array.from(new Set(list.map(m => String(m.donor))));
  const patientIds = Array.from(new Set(list.map(m => String(m.patient))));

  // Fetch user docs
  const donorUsers = await User.find({ _id: { $in: donorIds } }).select('email role donorProfile patientProfile').lean();
  const patientUsers = await User.find({ _id: { $in: patientIds } }).select('email role donorProfile patientProfile').lean();

  // Fetch donor profiles from Donor collection (richer info, keyed by userId)
  const donorProfiles = await (await import('../models/Donor.js')).default
    .find({ userId: { $in: donorIds } })
    .select('userId fullName name email bloodGroup city state country contact phone mobile').lean();

  const byId = (arr) => {
    const m = new Map();
    for (const x of arr) m.set(String(x._id || x.userId), x);
    return m;
  };
  const donorsByUserId = byId(donorUsers);
  const donorProfileByUserId = byId(donorProfiles.map(d => ({ ...d, _id: d.userId })));
  const patientsByUserId = byId(patientUsers);

  // Enrich and return
  const enriched = list.map(m => {
    const donorUser = donorsByUserId.get(String(m.donor));
    const donorProf = donorProfileByUserId.get(String(m.donor));
    const patientUser = patientsByUserId.get(String(m.patient));
    return {
      ...m,
      donorSummary: {
        userId: m.donor,
        name: donorProf?.fullName || donorProf?.name || donorUser?.donorProfile?.fullName || '',
        email: donorProf?.email || donorUser?.email || '',
        bloodGroup: donorProf?.bloodGroup || donorUser?.donorProfile?.bloodGroup || '',
        city: donorProf?.city || donorUser?.donorProfile?.city || '',
        state: donorProf?.state || donorUser?.donorProfile?.state || '',
        country: donorProf?.country || donorUser?.donorProfile?.country || '',
        contact: donorProf?.phone || donorProf?.mobile || donorProf?.contact || '',
      },
      patientSummary: {
        userId: m.patient,
        name: patientUser?.patientProfile?.fullName || '',
        email: patientUser?.email || '',
        bloodGroup: patientUser?.patientProfile?.bloodGroup || '',
        city: patientUser?.patientProfile?.city || '',
        state: patientUser?.patientProfile?.state || '',
        country: patientUser?.patientProfile?.country || '',
      }
    };
  });

  res.json(enriched);
});

// Admin: list all match requests
router.get('/all', authenticate, authorize(["admin"]), async (req, res) => {
  const list = await Match.find({}).sort({ updatedAt: -1 });
  res.json(list);
});

// Approve a match (also remove organ from verified list)
router.post("/approve", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { patientId, donorId, organ } = req.body;
    if (!patientId || !donorId) return res.status(400).json({ error: 'patientId and donorId are required' });

    // Update existing pending match or create approved
    let match = await Match.findOneAndUpdate(
      { patient: patientId, donor: donorId, ...(organ ? { organ } : {}) },
      { status: 'approved', updatedAt: Date.now(), ...(organ ? { organ } : {}) },
      { new: true, upsert: true }
    );

    // If organ provided, automatically mark the donor's donation request for that organ as Donated
    if (organ) {
      const updated = await DonationRequest.findOneAndUpdate(
        { donor: donorId, organ },
        { status: 'Donated', donatedAt: new Date(), updatedAt: Date.now() },
        { new: true }
      );
      // Sync related documents for that organ to 'donated'
      try {
        const Document = (await import('../models/Document.js')).default;
        await Document.updateMany({ user: donorId, organ }, { $set: { status: 'donated' } });
      } catch (e) {
        console.error('Failed to sync documents to donated on approve:', e?.message||e);
      }
    }

    // Notify patient via email with donor details
    (async () => {
      try {
        const patient = await User.findById(patientId).select('email name fullName patientProfile');
        const donorUser = await User.findById(donorId).select('email name fullName donorProfile');
        const DonorModel = (await import('../models/Donor.js')).default;
        const donorProf = await DonorModel.findOne({ userId: donorId }).select('fullName name email bloodGroup city state country contact phone mobile').lean();

        const donorName = donorProf?.fullName || donorProf?.name || donorUser?.fullName || donorUser?.name || 'Donor';
        const donorEmail = donorProf?.email || donorUser?.email || 'N/A';
        const donorBG = donorProf?.bloodGroup || donorUser?.donorProfile?.bloodGroup || 'N/A';
        const donorCity = donorProf?.city || donorUser?.donorProfile?.city || 'N/A';
        const donorState = donorProf?.state || donorUser?.donorProfile?.state || 'N/A';
        const donorCountry = donorProf?.country || donorUser?.donorProfile?.country || 'N/A';
        const donorPhone = donorProf?.phone || donorProf?.mobile || donorProf?.contact || 'N/A';

        const subject = `Your ${organ || ''} match is approved`;
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.5">
            <p>Dear ${(patient?.fullName||patient?.name||patient?.patientProfile?.fullName||'Patient')},</p>
            <p>Your match request has been approved by the administrator.</p>
            ${organ ? `<p><b>Organ:</b> ${organ}</p>` : ''}
            <div style="margin-top:10px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc">
              <div style="font-weight:600;margin-bottom:6px">Donor Details</div>
              <ul style="margin:0;padding-left:16px">
                <li><b>Name:</b> ${donorName}</li>
                <li><b>Email:</b> ${donorEmail}</li>
                <li><b>Blood Group:</b> ${donorBG}</li>
                <li><b>Location:</b> ${donorCity}, ${donorState}, ${donorCountry}</li>
                <li><b>Contact:</b> ${donorPhone}</li>
              </ul>
            </div>
            <p>Next steps will be coordinated by our team. Please check your portal for details.</p>
            <p style="margin-top:16px">Regards,<br/>RamSetu Health Bridge Team</p>
          </div>
        `;
        if (patient?.email) {
          await mailTransporter.sendMail({ from: process.env.EMAIL_USER, to: patient.email, subject, html });
        }

        // Also notify donor with patient contact overview (minimal set)
        try {
          const pName = patient?.fullName || patient?.name || patient?.patientProfile?.fullName || 'Patient';
          const pEmail = patient?.email || 'N/A';
          const pBG = patient?.patientProfile?.bloodGroup || 'N/A';
          const pCity = patient?.patientProfile?.city || 'N/A';
          const pState = patient?.patientProfile?.state || 'N/A';
          const pCountry = patient?.patientProfile?.country || 'N/A';
          const donorNoticeHtml = `
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.5">
              <p>Dear ${donorName},</p>
                <p>Your ${organ || ''} donation match was <b>approved</b> and the donation is now marked as <b>Donated</b>.</p>
              <div style="margin-top:10px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc">
                <div style="font-weight:600;margin-bottom:6px">Patient Details</div>
                <ul style="margin:0;padding-left:16px">
                  <li><b>Name:</b> ${pName}</li>
                  <li><b>Email:</b> ${pEmail}</li>
                  <li><b>Blood Group:</b> ${pBG}</li>
                  <li><b>Location:</b> ${pCity}, ${pState}, ${pCountry}</li>
                </ul>
              </div>
              <p>Our team will reach out with next steps.</p>
              <p style="margin-top:16px">Regards,<br/>RamSetu Health Bridge Team</p>
            </div>
          `;
          if (donorEmail && donorEmail !== 'N/A') {
            await mailTransporter.sendMail({ from: process.env.EMAIL_USER, to: donorEmail, subject: `Donation match approved${organ?` (${organ})`:''}`, html: donorNoticeHtml });
          }
        } catch (e) { /* non-fatal */ }
      } catch (e) { console.error('Failed to send patient mail for approval:', e?.message||e); }
    })();

    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Reject a match request
router.post('/reject', authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { matchId, patientId, donorId, organ } = req.body || {};
    let match;
    if (matchId) {
      match = await Match.findByIdAndUpdate(matchId, { status: 'rejected', updatedAt: Date.now() }, { new: true });
    } else if (patientId && donorId) {
      match = await Match.findOneAndUpdate(
        { patient: patientId, donor: donorId, ...(organ ? { organ } : {}) },
        { status: 'rejected', updatedAt: Date.now(), ...(organ ? { organ } : {}) },
        { new: true }
      );
    } else {
      return res.status(400).json({ error: 'Provide matchId or (patientId and donorId)' });
    }
    if (!match) return res.status(404).json({ error: 'Match not found' });

    // Notify patient via email
    (async () => {
      try {
        const patient = await User.findById(match.patient).select('email name fullName');
        const subject = `Your ${match.organ || ''} match request was rejected`;
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.5">
            <p>Dear ${(patient?.fullName||patient?.name||'Patient')},</p>
            <p>Your match request has been reviewed and could not be approved.</p>
            ${match.organ ? `<p><b>Organ:</b> ${match.organ}</p>` : ''}
            <p>Please contact support for queries or try requesting another donor.</p>
            <p style="margin-top:16px">Regards,<br/>RamSetu Health Bridge Team</p>
          </div>
        `;
        if (patient?.email) {
          await mailTransporter.sendMail({ from: process.env.EMAIL_USER, to: patient.email, subject, html });
        }
      } catch (e) { console.error('Failed to send patient mail for rejection:', e?.message||e); }
    })();

    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
