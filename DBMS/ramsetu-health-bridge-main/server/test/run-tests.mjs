// Minimal test harness for CI: import models to validate they load
import assert from 'assert';

const ok = (msg) => console.log('\u2714 ' + msg);

try {
  // Attempt dynamic imports of model files (no DB connection required)
  const models = [
    '../models/User.js',
    '../models/Donor.js',
    '../models/Patient.js',
    '../models/DonationRequest.js',
    '../models/PatientRequest.js',
    '../models/Match.js',
    '../models/Otp.js',
    '../models/Document.js',
  ];

  for (const m of models) {
    const mod = await import(m);
    assert(mod && (typeof mod.default === 'function' || typeof mod.default === 'object'));
    ok(`Loaded ${m}`);
  }

  ok('All models loaded successfully');
  process.exit(0);
} catch (err) {
  console.error('Test failed:', err);
  process.exit(2);
}
