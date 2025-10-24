import mongoose from 'mongoose';

const testReportSchema = new mongoose.Schema({
  label: String,
  value: String,
  fileUrl: String, // Path to uploaded file/image
});

const donationRequestSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true }, // Donor email required
  organ: { type: String, enum: ['Kidney', 'Liver', 'Heart', 'Cornea'], required: true },
  tests: [testReportSchema], // Array of test results (text + file)
  consent: { type: Boolean, required: true },
  // Status flow: Pending -> Verified -> Donated | Rejected
  status: { type: String, enum: ['Pending', 'Verified', 'Donated', 'Rejected'], default: 'Pending' },
  adminRemarks: String,
  // Optional: track donation finalization details
  donatedAt: { type: Date },
  donationDetails: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

donationRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('DonationRequest', donationRequestSchema);
