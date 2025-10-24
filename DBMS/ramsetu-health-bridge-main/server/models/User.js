import mongoose from "mongoose";



const donorProfileSchema = new mongoose.Schema({
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
  height: String,
  weight: String,
  bmi: String,
  bloodPressure: String,
  medicalHistory: String,
  allergies: String,
  diseases: String,
  pastSurgeries: String,
  organConditions: String,
  lifestyle: String,
  organs: [String],
  donorType: String,
  consentStatus: Boolean,
  consentDate: String,
  signature: {
    data: Buffer,
    contentType: String,
  },
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
}, { _id: false });

const patientProfileSchema = new mongoose.Schema({
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
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Allow same email to have multiple accounts for different roles.
  // Uniqueness is enforced on the compound index { email, role } below.
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["donor", "patient", "admin"], required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  donorProfile: donorProfileSchema,
  patientProfile: patientProfileSchema,
  createdAt: { type: Date, default: Date.now },
});

// Ensure a user is unique per (email, role) combination
userSchema.index({ email: 1, role: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
