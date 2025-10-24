import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: String,
  dob: String,
  gender: String,
  bloodGroup: String,
  address: String,
  city: String,
  state: String,
  country: String,
  contact: String,
  email: String,
  emergencyContact: String,
  govId: {
    data: Buffer,
    contentType: String,
  },
  kinConsent: Boolean,
  regId: String,
  regDate: String,
  regPlace: String,
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Patient", patientSchema);
