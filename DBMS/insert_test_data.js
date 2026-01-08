// Comprehensive test data insertion script
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './server/models/User.js';
import Patient from './server/models/Patient.js';
import Donor from './server/models/Donor.js';
import DonationRequest from './server/models/DonationRequest.js';
import Document from './server/models/Document.js';

const MONGO_URI = 'mongodb://localhost:27017/ramsetu-health-bridge';

const TEST_DATA = {
  testPassword: 'Test@12345',
  
  patients: [
    {
      email: 'patient.heart@test.com',
      fullName: 'Rajesh Kumar',
      bloodGroup: 'A+',
      organ: 'Heart',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0760,
      lon: 72.8777,
      contact: '9876543210',
      dob: '1985-05-15',
      gender: 'Male'
    }
  ],
  
  donors: [
    {
      email: 'donor1.heart@test.com',
      fullName: 'Amit Singh',
      bloodGroup: 'A+',
      organ: 'Heart',
      organs: ['Heart'],
      city: 'Bangalore',
      state: 'Karnataka',
      lat: 12.9716,
      lon: 77.5946,
      contact: '9123456789',
      dob: '1990-03-20',
      gender: 'Male',
      height: '180',
      weight: '75',
      bmi: '23.1',
      bloodPressure: '120/80',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor2.heart@test.com',
      fullName: 'Priya Sharma',
      bloodGroup: 'A+',
      organ: 'Heart',
      organs: ['Heart'],
      city: 'Delhi',
      state: 'Delhi',
      lat: 28.6139,
      lon: 77.2090,
      contact: '9234567890',
      dob: '1988-07-10',
      gender: 'Female',
      height: '165',
      weight: '60',
      bmi: '22.0',
      bloodPressure: '118/76',
      medicalHistory: 'No major diseases',
      allergies: 'Penicillin',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor3.heart@test.com',
      fullName: 'Vikram Patel',
      bloodGroup: 'A+',
      organ: 'Heart',
      organs: ['Heart'],
      city: 'Pune',
      state: 'Maharashtra',
      lat: 18.5204,
      lon: 73.8567,
      contact: '9345678901',
      dob: '1992-11-25',
      gender: 'Male',
      height: '175',
      weight: '70',
      bmi: '22.9',
      bloodPressure: '119/79',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    }
  ],

  donationTests: {
    Heart: [
      { label: 'Blood group', value: 'A+' },
      { label: 'Viral markers', value: 'negative' },
      { label: 'Echocardiography', value: 'normal' },
      { label: 'Angiography', value: 'no' },
      { label: 'Chest imaging', value: 'normal' },
      { label: 'General health', value: 'good' }
    ],
    Kidney: [
      { label: 'Blood group', value: 'A+' },
      { label: 'HLA match', value: 'medium' },
      { label: 'Renal function', value: 'normal' },
      { label: 'Imaging', value: 'normal' },
      { label: 'Cardiac risk', value: 'good' }
    ]
  }
};

async function insertTestData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    await Patient.deleteMany({});
    await Donor.deleteMany({});
    await DonationRequest.deleteMany({});
    await Document.deleteMany({});
    console.log('🗑️  Cleared existing test data');

    // ==================== CREATE PATIENT ====================
    console.log('\n📝 Creating Patient...');
    const patientData = TEST_DATA.patients[0];
    const patientUser = await User.create({
      email: patientData.email,
      password: await bcrypt.hash(TEST_DATA.testPassword, 10),
      role: 'patient',
      isVerified: true,
      patientProfile: {
        fullName: patientData.fullName,
        bloodGroup: patientData.bloodGroup,
        city: patientData.city,
        state: patientData.state,
        contact: patientData.contact,
        dob: patientData.dob,
        gender: patientData.gender,
        email: patientData.email
      }
    });

    const patientProfile = await Patient.create({
      userId: patientUser._id,
      fullName: patientData.fullName,
      bloodGroup: patientData.bloodGroup,
      city: patientData.city,
      state: patientData.state,
      contact: patientData.contact,
      dob: patientData.dob,
      gender: patientData.gender,
      email: patientData.email,
      lat: patientData.lat,
      lon: patientData.lon
    });

    console.log(`✅ Patient Created:`);
    console.log(`   Email: ${patientData.email}`);
    console.log(`   Password: ${TEST_DATA.testPassword}`);
    console.log(`   User ID: ${patientUser._id}`);
    console.log(`   Patient ID: ${patientProfile._id}`);

    // ==================== CREATE DONORS & DONATION REQUESTS ====================
    console.log('\n📝 Creating Donors and Donation Requests...');
    const donorCredentials = [];

    for (const donorData of TEST_DATA.donors) {
      // Create User
      const donorUser = await User.create({
        email: donorData.email,
        password: await bcrypt.hash(TEST_DATA.testPassword, 10),
        role: 'donor',
        isVerified: true,
        donorProfile: {
          fullName: donorData.fullName,
          bloodGroup: donorData.bloodGroup,
          city: donorData.city,
          state: donorData.state,
          contact: donorData.contact,
          dob: donorData.dob,
          gender: donorData.gender,
          organs: donorData.organs,
          consentStatus: donorData.consentStatus,
          kinConsent: donorData.kinConsent,
          email: donorData.email
        }
      });

      // Create Donor Profile
      const donorProfile = await Donor.create({
        userId: donorUser._id,
        fullName: donorData.fullName,
        bloodGroup: donorData.bloodGroup,
        city: donorData.city,
        state: donorData.state,
        contact: donorData.contact,
        dob: donorData.dob,
        gender: donorData.gender,
        organs: donorData.organs,
        organ: donorData.organ,
        height: donorData.height,
        weight: donorData.weight,
        bmi: donorData.bmi,
        bloodPressure: donorData.bloodPressure,
        medicalHistory: donorData.medicalHistory,
        allergies: donorData.allergies,
        donorType: donorData.donorType,
        consentStatus: donorData.consentStatus,
        kinConsent: donorData.kinConsent,
        email: donorData.email,
        lat: donorData.lat,
        lon: donorData.lon,
        regDate: new Date().toISOString().split('T')[0],
        regPlace: donorData.city
      });

      // Create Donation Request (with test data filled in!)
      const donationRequest = await DonationRequest.create({
        donor: donorUser._id,
        email: donorData.email,
        organ: donorData.organ,
        tests: TEST_DATA.donationTests[donorData.organ] || TEST_DATA.donationTests.Heart,
        consent: true,
        status: 'Verified', // IMPORTANT: Set to Verified so it can be matched
        adminRemarks: 'Test data - all tests completed'
      });

      // Create Document for donation
      const document = await Document.create({
        user: donorUser._id,
        type: 'medical',
        title: `${donorData.organ} Donation Medical Records`,
        description: `Medical records for ${donorData.organ} donation`,
        organ: donorData.organ,
        status: 'approved',
        tests: TEST_DATA.donationTests[donorData.organ] || TEST_DATA.donationTests.Heart
      });

      donorCredentials.push({
        name: donorData.fullName,
        email: donorData.email,
        password: TEST_DATA.testPassword,
        userId: donorUser._id,
        donorId: donorProfile._id,
        donationRequestId: donationRequest._id,
        documentId: document._id,
        organ: donorData.organ,
        bloodGroup: donorData.bloodGroup,
        lat: donorData.lat,
        lon: donorData.lon,
        tests: TEST_DATA.donationTests[donorData.organ]
      });

      console.log(`✅ Donor Created: ${donorData.fullName}`);
      console.log(`   Email: ${donorData.email}`);
      console.log(`   Password: ${TEST_DATA.testPassword}`);
      console.log(`   User ID: ${donorUser._id}`);
      console.log(`   Donor ID: ${donorProfile._id}`);
      console.log(`   Donation Request ID: ${donationRequest._id}`);
      console.log(`   Document ID: ${document._id}`);
      console.log(`   Organ: ${donorData.organ}`);
      console.log(`   Tests: ${TEST_DATA.donationTests[donorData.organ].map(t => `${t.label}=${t.value}`).join(', ')}`);
      console.log();
    }

    // ==================== PRINT SUMMARY ====================
    console.log('\n' + '='.repeat(70));
    console.log('TEST DATA SUMMARY - READY FOR TESTING');
    console.log('='.repeat(70));

    console.log('\n🔐 PATIENT CREDENTIALS:');
    console.log(`Email: ${patientData.email}`);
    console.log(`Password: ${TEST_DATA.testPassword}`);
    console.log(`User ID: ${patientUser._id}`);
    console.log(`Patient ID: ${patientProfile._id}`);
    console.log(`Blood Group: ${patientData.bloodGroup}`);
    console.log(`Location: ${patientData.city} (${patientData.lat}, ${patientData.lon})`);

    console.log('\n🏥 DONOR CREDENTIALS & DATA:');
    donorCredentials.forEach((donor, idx) => {
      console.log(`\n[DONOR ${idx + 1}] ${donor.name}`);
      console.log(`  Email: ${donor.email}`);
      console.log(`  Password: ${TEST_DATA.testPassword}`);
      console.log(`  User ID: ${donor.userId}`);
      console.log(`  Donor ID: ${donor.donorId}`);
      console.log(`  Donation Request ID: ${donor.donationRequestId}`);
      console.log(`  Document ID: ${donor.documentId}`);
      console.log(`  Organ: ${donor.organ}`);
      console.log(`  Blood Group: ${donor.bloodGroup}`);
      console.log(`  Location: ${donor.lat}, ${donor.lon}`);
      console.log(`  Tests:`);
      donor.tests.forEach(t => console.log(`    - ${t.label}: ${t.value}`));
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TEST DATA INSERTED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('\n📌 NEXT STEPS:');
    console.log('1. Login as patient with provided credentials');
    console.log('2. Request a Heart organ match');
    console.log('3. System will match with eligible donors');
    console.log('4. Check console logs for ML feature extraction');
    console.log('\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

insertTestData();
