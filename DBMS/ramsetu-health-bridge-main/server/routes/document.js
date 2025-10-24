import express from "express";
import multer from "multer";
import Document from "../models/Document.js";
import { authenticate } from "../middleware/auth.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store under server/uploads/documents to align with static serving
    const dir = path.join(__dirname, "../uploads/documents");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF/JPG/PNG allowed"));
  },
});

// Helper to build public-facing relative URL from stored file
function toPublicUrl(filePath) {
  // Normalize Windows paths and trim to '/uploads/...'
  const norm = filePath.replace(/\\/g, "/");
  const idx = norm.lastIndexOf("/uploads/");
  if (idx !== -1) return norm.slice(idx);
  // Fallback to documents subfolder
  const didx = norm.lastIndexOf("/uploads/documents/");
  if (didx !== -1) return norm.slice(didx);
  return norm;
}

// Upload a single document with optional metadata (backward compatible)
router.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  try {
    const { type, title, description, organ, details, tests } = req.body;
    const file = req.file;
    const fileMeta = file
      ? {
          fileUrl: toPublicUrl(file.path),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        }
      : null;

    // Parse optional JSON strings
    let parsedDetails = undefined;
    let parsedTests = undefined;
    try { if (details) parsedDetails = JSON.parse(details); } catch {}
    try { if (tests) parsedTests = JSON.parse(tests); } catch {}

    const payload = {
      user: req.user.id,
      type,
      title,
      description,
      organ,
      details: parsedDetails,
      tests: Array.isArray(parsedTests) ? parsedTests : undefined,
    };
    if (fileMeta) {
      payload.fileUrl = fileMeta.fileUrl; // keep backward compatibility
      payload.files = [fileMeta];
    }

    const doc = await Document.create(payload);
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err?.message || "Upload failed" });
  }
});

// Upload multiple files and save all details/images
router.post("/upload-multiple", authenticate, upload.array("files"), async (req, res) => {
  try {
    const { type, title, description, organ, details, tests } = req.body;
    const files = Array.isArray(req.files) ? req.files : [];

    const filesMeta = files.map((f) => ({
      fileUrl: toPublicUrl(f.path),
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
    }));

    // Parse optional JSON strings
    let parsedDetails = undefined;
    let parsedTests = undefined;
    try { if (details) parsedDetails = JSON.parse(details); } catch {}
    try { if (tests) parsedTests = JSON.parse(tests); } catch {}

    // If tests provided, try to attach fileUrl by index (best-effort)
    if (Array.isArray(parsedTests)) {
      parsedTests = parsedTests.map((t, idx) => ({
        ...t,
        fileUrl: t?.fileUrl || filesMeta[idx]?.fileUrl,
      }));
    }

    const doc = await Document.create({
      user: req.user.id,
      type,
      title,
      description,
      organ,
      details: parsedDetails,
      files: filesMeta,
      tests: Array.isArray(parsedTests) ? parsedTests : undefined,
    });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err?.message || "Upload failed" });
  }
});

// Get my documents
router.get("/my", authenticate, async (req, res) => {
  const filter = { user: req.user.id };
  const { status, organ } = req.query || {};
  if (typeof status === 'string' && status.trim()) {
    filter.status = status.trim();
  }
  if (typeof organ === 'string' && organ.trim()) {
    filter.organ = organ.trim();
  }
  const docs = await Document.find(filter).sort({ createdAt: -1 });
  res.json(docs);
});

export default router;
