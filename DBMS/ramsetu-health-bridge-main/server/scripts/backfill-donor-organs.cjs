// Script to backfill Donor collection with organ data from verified DonationRequest documents
// Usage: node scripts/backfill-donor-organs.cjs
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let DonationRequest = require('../models/DonationRequest');
let Donor = require('../models/Donor');
// Support both default and named exports (ESM/CJS interop)
if (DonationRequest.default) DonationRequest = DonationRequest.default;
if (Donor.default) Donor = Donor.default;

async function main() {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ramsetu-health-bridge';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Find all verified donation requests
  const verifiedRequests = await DonationRequest.find({ status: 'Verified' });
  console.log(`Found ${verifiedRequests.length} verified donation requests.`);

  // Map donorId to organs
  const donorOrgansMap = {};
  for (const req of verifiedRequests) {
    const donorId = req.donor?.toString();
    const organ = req.organ;
    if (!donorId || !organ) continue;
    if (!donorOrgansMap[donorId]) donorOrgansMap[donorId] = new Set();
    donorOrgansMap[donorId].add(organ);
  }

  // Update each donor document
  let updatedCount = 0;
  for (const [donorId, organsSet] of Object.entries(donorOrgansMap)) {
    const organsArr = Array.from(organsSet);
    // For compatibility, set both 'organs' (array) and 'organ' (string, first organ)
    const update = { organs: organsArr, organ: organsArr[0] };
    const res = await Donor.updateOne({ _id: donorId }, { $set: update });
    if (res.modifiedCount > 0) updatedCount++;
  }
  console.log(`Updated ${updatedCount} donor documents with organ data.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
