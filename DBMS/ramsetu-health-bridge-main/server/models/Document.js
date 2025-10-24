import mongoose from "mongoose";

// Schema to store metadata for each uploaded file
const fileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true }, // relative path like '/uploads/documents/<filename>'
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

// Optional structured "tests" captured from organ forms
const testSchema = new mongoose.Schema(
  {
    label: { type: String },
    value: { type: String },
    fileUrl: { type: String },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // e.g. 'medical', 'address', 'certificate'

  // Backward compatibility: keep single fileUrl optional (older clients)
  fileUrl: { type: String },

  // New fields for richer details and multiple images/files
  title: { type: String },
  description: { type: String },
  organ: { type: String }, // e.g., Kidney, Heart, Cornea, Liver
  details: { type: mongoose.Schema.Types.Mixed }, // arbitrary extra JSON details
  files: [fileSchema],
  tests: [testSchema],

  // Document status maps from donation requests: Pending->pending, Verified->approved, Donated->donated, Rejected->rejected
  status: { type: String, enum: ["pending", "approved", "donated", "rejected"], default: "pending" },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
