import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, default: "" },
  dob: String,
  gender: String,
  bloodGroup: String,
  address: String,
  city: String,
  state: String,
  country: String,
  contact: String,
  phone: String, // for dashboard compatibility
  mobile: String, // for dashboard compatibility
  email: { type: String, required: true },
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
  organ: String, // for dashboard compatibility (single organ)
  donorType: String,
  consentStatus: { type: Boolean, default: false },
  consent: { type: Boolean, default: false }, // for dashboard compatibility
  consentDate: String,
  signature: {
    data: Buffer,
    contentType: String,
  },
  kinConsent: { type: Boolean, default: false },
  regId: { type: String, unique: true, sparse: true },
  regDate: String,
  regPlace: String,
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  status: { type: String, default: "Active" }, // for dashboard/request status if needed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure one donor profile per user
donorSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("Donor", donorSchema);

// No change needed unless you want to add a virtual or helper for requests.
// The requests are fetched via DonationRequest model using donor's userId.
