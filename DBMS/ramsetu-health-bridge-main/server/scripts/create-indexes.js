/**
 * Database Index Creation Script
 * Run once to optimize query performance
 * Usage: node scripts/create-indexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Patient from '../models/Patient.js';
import Match from '../models/Match.js';
import DonationRequest from '../models/DonationRequest.js';
import PatientRequest from '../models/PatientRequest.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ramsetu-health-bridge';

const createIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Creating indexes...\n');

    // User indexes
    console.log('📍 User Collection Indexes');
    await User.collection.createIndex({ email: 1, role: 1 }, { unique: true });
    console.log('  ✓ Unique index on (email, role)');
    
    await User.collection.createIndex({ role: 1 });
    console.log('  ✓ Index on role');
    
    await User.collection.createIndex({ isVerified: 1 });
    console.log('  ✓ Index on isVerified');
    
    await User.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Index on createdAt (desc)');

    // Donor indexes
    console.log('\n📍 Donor Collection Indexes');
    await Donor.collection.createIndex({ userId: 1 }, { unique: true });
    console.log('  ✓ Unique index on userId');
    
    await Donor.collection.createIndex({ email: 1 });
    console.log('  ✓ Index on email');
    
    await Donor.collection.createIndex({ organ: 1 });
    console.log('  ✓ Index on organ');
    
    await Donor.collection.createIndex({ bloodGroup: 1 });
    console.log('  ✓ Index on bloodGroup');
    
    await Donor.collection.createIndex({ status: 1 });
    console.log('  ✓ Index on status');
    
    await Donor.collection.createIndex({ organ: 1, bloodGroup: 1 });
    console.log('  ✓ Compound index on (organ, bloodGroup)');
    
    await Donor.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Index on createdAt (desc)');

    // Patient indexes
    console.log('\n📍 Patient Collection Indexes');
    await Patient.collection.createIndex({ userId: 1 });
    console.log('  ✓ Index on userId');
    
    await Patient.collection.createIndex({ email: 1 });
    console.log('  ✓ Index on email');
    
    await Patient.collection.createIndex({ bloodGroup: 1 });
    console.log('  ✓ Index on bloodGroup');
    
    await Patient.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Index on createdAt (desc)');

    // Match indexes
    console.log('\n📍 Match Collection Indexes');
    await Match.collection.createIndex({ patient: 1, donor: 1, organ: 1 });
    console.log('  ✓ Compound index on (patient, donor, organ)');
    
    await Match.collection.createIndex({ patient: 1, status: 1 });
    console.log('  ✓ Compound index on (patient, status)');
    
    await Match.collection.createIndex({ donor: 1, status: 1 });
    console.log('  ✓ Compound index on (donor, status)');
    
    await Match.collection.createIndex({ status: 1 });
    console.log('  ✓ Index on status');
    
    await Match.collection.createIndex({ matchedAt: -1 });
    console.log('  ✓ Index on matchedAt (desc)');

    // DonationRequest indexes
    console.log('\n📍 DonationRequest Collection Indexes');
    await DonationRequest.collection.createIndex({ donor: 1 });
    console.log('  ✓ Index on donor');
    
    await DonationRequest.collection.createIndex({ email: 1 });
    console.log('  ✓ Index on email');
    
    await DonationRequest.collection.createIndex({ organ: 1 });
    console.log('  ✓ Index on organ');
    
    await DonationRequest.collection.createIndex({ status: 1 });
    console.log('  ✓ Index on status');
    
    await DonationRequest.collection.createIndex({ donor: 1, status: 1 });
    console.log('  ✓ Compound index on (donor, status)');
    
    await DonationRequest.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Index on createdAt (desc)');

    // PatientRequest indexes (if exists)
    try {
      console.log('\n📍 PatientRequest Collection Indexes');
      await PatientRequest.collection.createIndex({ patient: 1 });
      console.log('  ✓ Index on patient');
      
      await PatientRequest.collection.createIndex({ organ: 1 });
      console.log('  ✓ Index on organ');
      
      await PatientRequest.collection.createIndex({ status: 1 });
      console.log('  ✓ Index on status');
      
      await PatientRequest.collection.createIndex({ createdAt: -1 });
      console.log('  ✓ Index on createdAt (desc)');
    } catch (err) {
      console.log('  ⚠ PatientRequest collection not found (optional)');
    }

    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating indexes:', err.message);
    process.exit(1);
  }
};

createIndexes();
