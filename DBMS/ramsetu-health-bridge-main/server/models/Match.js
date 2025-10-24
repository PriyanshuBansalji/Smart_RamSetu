import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organ: { type: String, enum: ["Kidney", "Liver", "Heart", "Cornea"], required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  matchedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Match", matchSchema);
