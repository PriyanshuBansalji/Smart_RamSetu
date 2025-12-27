import mongoose from "mongoose";

const patientRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organ: { type: String, required: true },
  tests: { type: Array, default: [] },
  consent: { type: Boolean, default: false },
  status: { type: String, default: "Pending" },
  matchScore: { type: Number },
  matchDonor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bestMatchDonor: {
    donorId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    city: String,
    state: String,
    bloodGroup: String,
    matchScore: Number,
    matchPercentage: Number,
  },
  mlError: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("PatientRequest", patientRequestSchema);
