// Verify test data in database
import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Donor from '../models/Donor.js';
import DonationRequest from '../models/DonationRequest.js';

const MONGO_URI = 'mongodb://localhost:27017/ramsetu_organ_donor';

async function verifyData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`Database: ${mongoose.connection.name}`);

    // Check Users
    const userCount = await User.countDocuments();
    console.log(`\n📊 TOTAL USERS: ${userCount}`);
    
    const testUsers = await User.countDocuments({ email: { $regex: '@test.com$' } });
    console.log(`📊 Test Users: ${testUsers}`);
    
    const patients = await User.find({ role: 'patient', email: { $regex: '@test.com$' } }).select('email role');
    console.log(`\n👥 PATIENTS (${patients.length}):`);
    patients.forEach(p => console.log(`  - ${p.email}`));
    
    const donors = await User.find({ role: 'donor', email: { $regex: '@test.com$' } }).select('email role');
    console.log(`\n🏥 DONORS (${donors.length}):`);
    donors.forEach(d => console.log(`  - ${d.email}`));

    // Check Donation Requests
    const donationCount = await DonationRequest.countDocuments();
    console.log(`\n📝 TOTAL DONATION REQUESTS: ${donationCount}`);
    
    const verifiedDonations = await DonationRequest.countDocuments({ status: 'Verified' });
    console.log(`✅ Verified Donations: ${verifiedDonations}`);

    // Check by organ
    const heartDonors = await DonationRequest.countDocuments({ organ: 'Heart', status: 'Verified' });
    const kidneyDonors = await DonationRequest.countDocuments({ organ: 'Kidney', status: 'Verified' });
    const liverDonors = await DonationRequest.countDocuments({ organ: 'Liver', status: 'Verified' });
    const corneaDonors = await DonationRequest.countDocuments({ organ: 'Cornea', status: 'Verified' });
    
    console.log(`\n🩺 VERIFIED DONATIONS BY ORGAN:`);
    console.log(`  ❤️  Heart: ${heartDonors}`);
    console.log(`  🫘 Kidney: ${kidneyDonors}`);
    console.log(`  🫘 Liver: ${liverDonors}`);
    console.log(`  👁️  Cornea: ${corneaDonors}`);

    // Sample donation request with tests
    console.log(`\n📋 SAMPLE DONATION REQUEST (with tests):`);
    const sample = await DonationRequest.findOne({ status: 'Verified' }).lean();
    if (sample) {
      console.log(`  Organ: ${sample.organ}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Tests count: ${sample.tests ? sample.tests.length : 0}`);
      if (sample.tests && sample.tests.length > 0) {
        console.log(`  Sample tests:`);
        sample.tests.slice(0, 3).forEach(t => {
          console.log(`    - ${t.label}: ${t.value}`);
        });
      }
    }

    console.log(`\n✅ Verification Complete!`);
    await mongoose.disconnect();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyData();
