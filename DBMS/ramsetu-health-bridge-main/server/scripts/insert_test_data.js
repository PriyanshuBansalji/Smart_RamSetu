// Comprehensive test data insertion script
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Donor from '../models/Donor.js';
import DonationRequest from '../models/DonationRequest.js';
import Document from '../models/Document.js';

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
    },
    {
      email: 'patient.kidney@test.com',
      fullName: 'Priya Desai',
      bloodGroup: 'B+',
      organ: 'Kidney',
      city: 'Hyderabad',
      state: 'Telangana',
      lat: 17.3850,
      lon: 78.4867,
      contact: '9988776655',
      dob: '1987-08-22',
      gender: 'Female'
    },
    {
      email: 'patient.liver@test.com',
      fullName: 'Arjun Iyer',
      bloodGroup: 'O+',
      organ: 'Liver',
      city: 'Chennai',
      state: 'Tamil Nadu',
      lat: 13.0827,
      lon: 80.2707,
      contact: '9876543211',
      dob: '1980-11-10',
      gender: 'Male'
    },
    {
      email: 'patient.cornea@test.com',
      fullName: 'Sneha Verma',
      bloodGroup: 'AB+',
      organ: 'Cornea',
      city: 'Jaipur',
      state: 'Rajasthan',
      lat: 26.9124,
      lon: 75.7873,
      contact: '9765432198',
      dob: '1992-02-14',
      gender: 'Female'
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
    },
    {
      email: 'donor4.heart@test.com',
      fullName: 'Deepak Nair',
      bloodGroup: 'A+',
      organ: 'Heart',
      organs: ['Heart'],
      city: 'Kochi',
      state: 'Kerala',
      lat: 9.9312,
      lon: 76.2673,
      contact: '9456789012',
      dob: '1989-09-05',
      gender: 'Male',
      height: '178',
      weight: '72',
      bmi: '22.7',
      bloodPressure: '121/81',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    // KIDNEY DONORS (B+)
    {
      email: 'donor1.kidney@test.com',
      fullName: 'Suresh Reddy',
      bloodGroup: 'B+',
      organ: 'Kidney',
      organs: ['Kidney'],
      city: 'Hyderabad',
      state: 'Telangana',
      lat: 17.3850,
      lon: 78.4867,
      contact: '9567890123',
      dob: '1986-04-12',
      gender: 'Male',
      height: '172',
      weight: '68',
      bmi: '22.9',
      bloodPressure: '119/78',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor2.kidney@test.com',
      fullName: 'Kavya Desai',
      bloodGroup: 'B+',
      organ: 'Kidney',
      organs: ['Kidney'],
      city: 'Bangalore',
      state: 'Karnataka',
      lat: 12.9716,
      lon: 77.5946,
      contact: '9678901234',
      dob: '1991-06-18',
      gender: 'Female',
      height: '162',
      weight: '58',
      bmi: '22.1',
      bloodPressure: '117/75',
      medicalHistory: 'No major diseases',
      allergies: 'Sulfa',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor3.kidney@test.com',
      fullName: 'Sanjay Gupta',
      bloodGroup: 'B+',
      organ: 'Kidney',
      organs: ['Kidney'],
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      lat: 26.8467,
      lon: 80.9462,
      contact: '9789012345',
      dob: '1988-01-30',
      gender: 'Male',
      height: '176',
      weight: '71',
      bmi: '22.9',
      bloodPressure: '120/80',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    // LIVER DONORS (O+)
    {
      email: 'donor1.liver@test.com',
      fullName: 'Arjun Mishra',
      bloodGroup: 'O+',
      organ: 'Liver',
      organs: ['Liver'],
      city: 'Kolkata',
      state: 'West Bengal',
      lat: 22.5726,
      lon: 88.3639,
      contact: '9890123456',
      dob: '1987-07-08',
      gender: 'Male',
      height: '179',
      weight: '74',
      bmi: '23.0',
      bloodPressure: '121/81',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor2.liver@test.com',
      fullName: 'Divya Iyer',
      bloodGroup: 'O+',
      organ: 'Liver',
      organs: ['Liver'],
      city: 'Chennai',
      state: 'Tamil Nadu',
      lat: 13.0827,
      lon: 80.2707,
      contact: '9901234567',
      dob: '1990-03-22',
      gender: 'Female',
      height: '168',
      weight: '62',
      bmi: '22.0',
      bloodPressure: '118/76',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor3.liver@test.com',
      fullName: 'Manish Kumar',
      bloodGroup: 'O+',
      organ: 'Liver',
      organs: ['Liver'],
      city: 'Indore',
      state: 'Madhya Pradesh',
      lat: 22.7196,
      lon: 75.8577,
      contact: '9012345678',
      dob: '1986-10-15',
      gender: 'Male',
      height: '174',
      weight: '69',
      bmi: '22.8',
      bloodPressure: '119/79',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    // CORNEA DONORS (AB+)
    {
      email: 'donor1.cornea@test.com',
      fullName: 'Ritika Bhat',
      bloodGroup: 'AB+',
      organ: 'Cornea',
      organs: ['Cornea'],
      city: 'Jaipur',
      state: 'Rajasthan',
      lat: 26.9124,
      lon: 75.7873,
      contact: '9123456788',
      dob: '1993-12-01',
      gender: 'Female',
      height: '164',
      weight: '57',
      bmi: '21.2',
      bloodPressure: '116/74',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor2.cornea@test.com',
      fullName: 'Arun Chopra',
      bloodGroup: 'AB+',
      organ: 'Cornea',
      organs: ['Cornea'],
      city: 'Chandigarh',
      state: 'Chandigarh',
      lat: 30.7333,
      lon: 76.7794,
      contact: '9234567899',
      dob: '1988-05-20',
      gender: 'Male',
      height: '180',
      weight: '76',
      bmi: '23.5',
      bloodPressure: '122/82',
      medicalHistory: 'No major diseases',
      allergies: 'None',
      donorType: 'Living',
      consentStatus: true,
      kinConsent: true
    },
    {
      email: 'donor3.cornea@test.com',
      fullName: 'Pooja Walia',
      bloodGroup: 'AB+',
      organ: 'Cornea',
      organs: ['Cornea'],
      city: 'Ludhiana',
      state: 'Punjab',
      lat: 30.9010,
      lon: 75.8573,
      contact: '9345678900',
      dob: '1994-08-10',
      gender: 'Female',
      height: '166',
      weight: '59',
      bmi: '21.4',
      bloodPressure: '117/75',
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
      { label: 'Blood group', value: 'B+' },
      { label: 'HLA match', value: 'medium' },
      { label: 'Renal function', value: 'normal' },
      { label: 'Imaging', value: 'normal' },
      { label: 'Cardiac risk', value: 'good' }
    ],
    Liver: [
      { label: 'Blood group', value: 'O+' },
      { label: 'Liver function', value: 'normal' },
      { label: 'Viral markers', value: 'negative' },
      { label: 'Imaging', value: 'normal' },
      { label: 'General health', value: 'good' }
    ],
    Cornea: [
      { label: 'Blood group', value: 'AB+' },
      { label: 'Eye health', value: 'good' },
      { label: 'Corneal thickness', value: 'normal' },
      { label: 'Imaging', value: 'normal' }
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

    // ==================== CREATE PATIENTS ====================
    console.log('\n📝 Creating Patients...');
    const patientCredentials = [];

    for (const patientData of TEST_DATA.patients) {
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

      patientCredentials.push({
        name: patientData.fullName,
        email: patientData.email,
        password: TEST_DATA.testPassword,
        userId: patientUser._id,
        patientId: patientProfile._id,
        organ: patientData.organ,
        bloodGroup: patientData.bloodGroup,
        city: patientData.city,
        lat: patientData.lat,
        lon: patientData.lon
      });

      console.log(`✅ Patient Created: ${patientData.fullName}`);
      console.log(`   Email: ${patientData.email}`);
      console.log(`   Password: ${TEST_DATA.testPassword}`);
      console.log(`   User ID: ${patientUser._id}`);
      console.log(`   Patient ID: ${patientProfile._id}`);
      console.log(`   Organ: ${patientData.organ}`);
      console.log();
    }

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
    patientCredentials.forEach((patient, idx) => {
      console.log(`\n[PATIENT ${idx + 1}] ${patient.name}`);
      console.log(`  Email: ${patient.email}`);
      console.log(`  Password: ${TEST_DATA.testPassword}`);
      console.log(`  User ID: ${patient.userId}`);
      console.log(`  Patient ID: ${patient.patientId}`);
      console.log(`  Organ Needed: ${patient.organ}`);
      console.log(`  Blood Group: ${patient.bloodGroup}`);
      console.log(`  Location: ${patient.city} (${patient.lat}, ${patient.lon})`);
    });

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
