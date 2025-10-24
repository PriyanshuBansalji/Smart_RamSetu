import express from 'express';
const router = express.Router();
import DonationRequest from '../models/DonationRequest.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js'; // Add this import
import Donor from '../models/Donor.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/donation-reports'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Nodemailer transporter (reuse across requests)
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: persist a Document entry capturing donation request details and files
async function saveDocumentForDonation({ userId, organ, email, testsArr, files, consent }) {
  try {
    const filesMeta = Array.isArray(files)
      ? files.map((f) => ({
          fileUrl: '/uploads/donation-reports/' + f.filename,
          originalName: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
        }))
      : [];

    // Best-effort: ensure each test has a fileUrl if a corresponding file was uploaded
    const tests = Array.isArray(testsArr)
      ? testsArr.map((t, idx) => ({
          label: t?.label,
          value: t?.value,
          fileUrl: t?.fileUrl || filesMeta[idx]?.fileUrl,
        }))
      : [];

    await Document.create({
      user: userId,
      type: 'medical',
      title: `${organ} Donation Tests`,
      description: `Submitted tests and attachments for ${organ} donation`,
      organ,
      details: { email, consent },
      files: filesMeta,
      tests,
      status: 'pending',
    });
  } catch (e) {
    console.error('Failed to save Document for donation request:', e?.message || e);
  }
}

// Submit new donation request (with or without files)
router.post('/:organ', authenticate, upload.array('files'), async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: "Authentication failed. Please log in again." });
  }

  try {
    // Always use logged-in user's id and email
    const donorId = req.user._id;
    let email = req.user.email;

    // Fallback: fetch email from User model if not present in JWT
    if (!email) {
      const userDoc = await User.findById(donorId).select("email");
      email = userDoc?.email;
      console.log("Fetched email from DB:", email);
    }

    // Parse tests array
    let testArr = [];
    if (typeof req.body.tests === "string") {
      testArr = JSON.parse(req.body.tests || '[]');
    } else if (Array.isArray(req.body.tests)) {
      testArr = req.body.tests;
    }

    // Attach file URLs if files are uploaded
    if (req.files && req.files.length) {
      req.files.forEach((file, idx) => {
        if (testArr[idx]) testArr[idx].fileUrl = '/uploads/donation-reports/' + file.filename;
      });
    }

    const organ = req.params.organ;
    const consent = req.body.consent === "true" || req.body.consent === true;

    // Debug log for incoming data
    console.log("Organ form submission:", {
      donorId,
      email,
      organ,
      consent,
      tests: testArr,
      files: req.files,
    });

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error("Invalid email:", email);
      return res.status(400).json({ error: 'Donor email is required and must be valid.' });
    }
    if (!organ) {
      console.error("Missing organ:", organ);
      return res.status(400).json({ error: 'Organ is required.' });
    }
    if (typeof consent === "undefined") {
      console.error("Missing consent:", consent);
      return res.status(400).json({ error: 'Consent is required.' });
    }

    // Check for existing request for this donor and organ
    const organRequest = await DonationRequest.findOne({ donor: donorId, organ });
    if (organRequest) {
      organRequest.status = 'Pending';
      organRequest.tests = testArr;
      organRequest.consent = consent;
      organRequest.email = email;
      organRequest.updatedAt = Date.now();
      await organRequest.save();
      // Persist a document record for this update (new entry for audit trail)
      await saveDocumentForDonation({ userId: donorId, organ, email, testsArr: testArr, files: req.files, consent });
      return res.status(200).json(organRequest);
    }

    // Create new request
    const donation = await DonationRequest.create({
      donor: donorId,
      email,
      organ,
      tests: testArr,
      consent,
    });
    // Persist a document record for this new submission
    await saveDocumentForDonation({ userId: donorId, organ, email, testsArr: testArr, files: req.files, consent });
    res.status(201).json(donation);
  } catch (err) {
    console.error("Organ form error:", err);
    res.status(400).json({ error: err.message });
  }
});

// New route to handle donation request directly from body (for testing or API client use)
router.post('/donation-request', async (req, res) => {
  // Log the incoming request for debugging
  console.log('Organ form submission:', req.body);

  const { donorId, email, organ, consent, tests, files } = req.body;

  // Defensive: log if missing donorId/email
  if (!donorId || !email) {
    console.error("Missing donorId or email in organ donation request:", req.body);
  }

  // Email validation regex
  function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (!donorId) {
    return res.status(400).json({ error: "Donor ID is required." });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Valid donor email is required." });
  }

  // If tests is a string, parse it; if it's already an array, use as is
  let testArr = [];
  if (typeof tests === "string") {
    testArr = JSON.parse(tests || '[]');
  } else if (Array.isArray(tests)) {
    testArr = tests;
  }

  // Attach file URLs if files are uploaded
  if (files && files.length) {
    files.forEach((file, idx) => {
      if (testArr[idx]) testArr[idx].fileUrl = '/uploads/donation-reports/' + file.filename;
    });
  }

  try {
    // Debug log for incoming data
    console.log("Organ form submission (direct):", {
      donorId,
      email,
      organ,
      consent,
      tests,
      files,
    });

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error("Invalid email:", email);
      return res.status(400).json({ error: 'Donor email is required and must be valid.' });
    }
    if (!organ) {
      console.error("Missing organ:", organ);
      return res.status(400).json({ error: 'Organ is required.' });
    }
    if (typeof consent === "undefined") {
      console.error("Missing consent:", consent);
      return res.status(400).json({ error: 'Consent is required.' });
    }

    // Check for existing request for this donor and organ
    const organRequest = await DonationRequest.findOne({ donor: donorId, organ });
    if (organRequest) {
      organRequest.status = 'Pending';
      organRequest.tests = testArr;
      organRequest.consent = consent;
      organRequest.email = email;
      organRequest.updatedAt = Date.now();
      await organRequest.save();
      // Attempt to persist a document entry as well (no multer here, so only tests URLs if provided)
      await saveDocumentForDonation({ userId: donorId, organ, email, testsArr: testArr, files: [], consent });
      return res.status(200).json(organRequest);
    }

    // Create new request
    const donation = await DonationRequest.create({
      donor: donorId,
      email,
      organ,
      tests: testArr,
      consent,
    });
    await saveDocumentForDonation({ userId: donorId, organ, email, testsArr: testArr, files: [], consent });
    res.status(201).json(donation);
  } catch (err) {
    console.error("Organ form error (direct):", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all requests for logged-in donor
router.get('/my', authenticate, async (req, res) => {
  const requests = await DonationRequest.find({ donor: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
});

// Get single request
router.get('/:id', authenticate, async (req, res) => {
  const request = await DonationRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Not found' });
  res.json(request);
});

// Admin: update status
// Admin: update status (only admin role allowed)
router.put('/:id/status', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status, adminRemarks, donationDetails } = req.body;

    // Validate status
    const allowed = ['Pending', 'Verified', 'Donated', 'Rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed values: ${allowed.join(', ')}` });
    }

    const request = await DonationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Donation request not found' });

    request.status = status;
    if (typeof adminRemarks !== 'undefined') request.adminRemarks = adminRemarks;
    if (status === 'Donated') {
      request.donatedAt = new Date();
      if (typeof donationDetails !== 'undefined') {
        try {
          request.donationDetails = typeof donationDetails === 'string' ? JSON.parse(donationDetails) : donationDetails;
        } catch {
          request.donationDetails = { note: String(donationDetails) };
        }
      }
    }
    request.updatedAt = Date.now();
    await request.save();

    // Sync related Document records' status for the same user and organ
    try {
      let docStatus = 'pending';
      if (status === 'Verified') docStatus = 'approved';
      if (status === 'Donated') docStatus = 'donated';
      if (status === 'Rejected') docStatus = 'rejected';
      await Document.updateMany({ user: request.donor, organ: request.organ }, { $set: { status: docStatus } });
    } catch (syncErr) {
      console.error('Failed to sync Document status:', syncErr?.message || syncErr);
    }

    // Fire-and-forget email notification to donor
    (async () => {
      try {
        const donorEmail = request.email;
        // Try to get a friendly name
        let donorName = '';
        try {
          const donorDoc = await Donor.findOne({ userId: request.donor }).select('fullName name email');
          donorName = donorDoc?.fullName || donorDoc?.name || '';
        } catch {}

        const subject = status === 'Donated'
          ? `Your ${request.organ} donation is marked as Donated`
          : `Your ${request.organ} donation request status: ${status}`;
        const dashboardUrl = process.env.BASE_URL || 'http://localhost:5000';
        let docsHtml = '';
        if (status === 'Donated') {
          try {
            const docs = await Document.find({ user: request.donor, organ: request.organ }).lean();
            if (Array.isArray(docs) && docs.length > 0) {
              const base = (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
              const items = docs.map((d, idx) => {
                const files = Array.isArray(d.files) ? d.files.map(f => `<li><a href="${base}${f.fileUrl}" target="_blank">${f.originalName || f.fileUrl}</a></li>`).join('') : '';
                const tests = Array.isArray(d.tests) ? d.tests.map(t => `<li>${t.label || 'Test'}: ${t.value || ''}${t.fileUrl ? ` - <a href=\"${base}${t.fileUrl}\" target=\"_blank\">file</a>` : ''}</li>`).join('') : '';
                return `
                  <li>
                    <div><b>${d.title || `Document ${idx + 1}`}</b> — status: ${d.status || 'pending'}</div>
                    ${files ? `<div>Files:<ul>${files}</ul></div>` : ''}
                    ${tests ? `<div>Tests:<ul>${tests}</ul></div>` : ''}
                  </li>
                `;
              }).join('');
              docsHtml = `<div><b>Submitted documents for ${request.organ}:</b><ul>${items}</ul></div>`;
            }
          } catch {}
        }
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.5">
            <p>Dear ${donorName || 'Donor'},</p>
            <p>Your organ donation request has been updated by the administrator.</p>
            <ul>
              <li><b>Organ:</b> ${request.organ}</li>
              <li><b>Status:</b> <span style=\"text-transform:uppercase;\">${status}</span></li>
              ${adminRemarks ? `<li><b>Remarks:</b> ${adminRemarks}</li>` : ''}
              ${status === 'Donated' && request.donatedAt ? `<li><b>Donated at:</b> ${new Date(request.donatedAt).toLocaleString()}</li>` : `<li><b>Updated at:</b> ${new Date(request.updatedAt).toLocaleString()}</li>`}
            </ul>
            ${docsHtml}
            <p>You can check the latest status by logging in to the portal.</p>
            <p><a href="${dashboardUrl}" target="_blank">Open RamSetu Health Bridge</a></p>
            <p style="margin-top:16px">Regards,<br/>RamSetu Health Bridge Team</p>
          </div>
        `;

        if (donorEmail) {
          await mailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: donorEmail,
            subject,
            html,
          });
        }
      } catch (mailErr) {
        console.error('Failed to send status update email:', mailErr?.message || mailErr);
      }
    })();

    res.json(request);
  } catch (err) {
    console.error('Error updating donation request status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add: Get all requests by donor userId (for frontend compatibility)
router.get('/by-donor/:id', authenticate, async (req, res) => {
  try {
    console.log('by-donor auth user:', req.user);
    // Allow if admin, or if the user is requesting their own data
    const isAdmin = req.user?.role === 'admin';
    const isSelf = String(req.user._id) === String(req.params.id);
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Accept either Donor document _id or User _id
    let userId = req.params.id;
    try {
      const donorDoc = await Donor.findById(req.params.id).select('userId').lean();
      if (donorDoc?.userId) {
        userId = donorDoc.userId;
      }
    } catch (e) {
      // ignore, fall back to using provided id
    }
    const requests = await DonationRequest.find({ donor: userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add: Get all requests by donor email (for frontend compatibility)
router.get('/by-email/:email', authenticate, async (req, res) => {
  try {
    const requests = await DonationRequest.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donation requests (dashboard/admin)
router.get('/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const requests = await DonationRequest.find({}).sort({ createdAt: -1 });
    res.status(200).json(requests); // Explicit status code
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: grouped list of verified organs per donor
// Response: { countDonors: number, map: { [userId: string]: string[] } }
router.get('/public/verified-by-donor', async (req, res) => {
  try {
    const status = (req.query.status || 'Verified').toString();
    const filter = status === 'any' ? {} : { status };
    const requests = await DonationRequest.find(filter).select('donor organ status').lean();
    const tmp = new Map(); // donorId -> Set(organs)
    for (const r of requests) {
      const id = String(r.donor);
      if (!tmp.has(id)) tmp.set(id, new Set());
      if (r.organ) tmp.get(id).add(r.organ);
    }
    const map = {};
    for (const [k, set] of tmp.entries()) {
      map[k] = Array.from(set);
    }
    res.json({ countDonors: Object.keys(map).length, map });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Public: list donors who have a donation request for a given organ
// Optional query: ?status=Verified|Pending|Rejected|any (default: Verified)
router.get('/public/by-organ/:organ', async (req, res) => {
  try {
    const organ = req.params.organ;
    const status = (req.query.status || 'Verified').toString();
    if (!organ) return res.status(400).json({ error: 'Organ is required' });

    const filter = { organ };
    if (status !== 'any') Object.assign(filter, { status });

    // Find matching requests and collect donor userIds
    const requests = await DonationRequest.find(filter).select('donor').lean();
    const userIds = Array.from(new Set(requests.map(r => String(r.donor))));

    // Optionally return minimal donor profiles for convenience
    const donors = await Donor.find({ userId: { $in: userIds } })
      .select('userId fullName name email bloodGroup city state country organs organ')
      .lean();

    res.json({ count: userIds.length, userIds, donors });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
