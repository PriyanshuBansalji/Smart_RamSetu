# Database Schema (Derived from Code)

This file maps the actual Mongoose models in `ramsetu-health-bridge-main/server/models` to collections, fields, indexes and notes. Use this as the authoritative source-of-truth for the current codebase.

## `User` (collection: `users`)
- Model file: `server/models/User.js`
- Fields:
  - `_id` (ObjectId)
  - `email` (String, required)
  - `password` (String, required)
  - `role` (String enum: `donor|patient|admin`, required)
  - `isVerified` (Boolean, default: false)
  - `verificationToken` (String)
  - `donorProfile` (embedded object)
    - donorProfile fields: fullName, dob, gender, bloodGroup, address, city, state, country, contact, email, emergencyContact, height, weight, bmi, bloodPressure, medicalHistory, allergies, diseases, pastSurgeries, organConditions, lifestyle, organs (array), donorType, consentStatus (Boolean), consentDate, signature (data Buffer + contentType), govId (Buffer + contentType), kinConsent, regId, regDate, regPlace, profileImage (Buffer+contentType)
  - `patientProfile` (embedded object)
    - patientProfile fields: fullName, dob, gender, bloodGroup, address, city, state, country, contact, email, emergencyContact, govId (buffer), kinConsent, regId, regDate, regPlace, profileImage
  - `createdAt` (Date)

- Indexes:
  - compound `{ email:1, role:1 }` with `unique: true` (ensures uniqueness per role)

Notes:
- `donorProfile` and `patientProfile` are embedded subdocuments with `{ _id: false }` — they do not create separate collections.

## `Donor` (collection: `donors`)
- Model file: `server/models/Donor.js`
- Fields:
  - `_id` (ObjectId)
  - `userId` (ObjectId ref `User`, required)
  - `fullName`, `dob`, `gender`, `bloodGroup`, `address`, `city`, `state`, `country`, `contact`
  - `phone`, `mobile` (backwards/dashboard compatibility)
  - `email` (required)
  - `emergencyContact`, `height`, `weight`, `bmi`, `bloodPressure`, `medicalHistory`, `allergies`, `diseases`, `pastSurgeries`, `organConditions`, `lifestyle`
  - `organs` (array of String)
  - `organ` (single organ, compatibility)
  - `donorType`, `consentStatus` (Boolean default false), `consent` (Boolean), `consentDate`
  - `signature` (Buffer + contentType), `kinConsent` (Boolean)
  - `regId` (String, unique, sparse), `regDate`, `regPlace`
  - `profileImage` (Buffer + contentType)
  - `status` (String default `Active`)
  - `createdAt`, `updatedAt` (Date)

- Indexes:
  - `{ userId: 1 }` unique
  - `regId` unique sparse (declared on field)

Notes:
- `userId` enforces one donor per user via unique index.

## `Patient` (collection: `patients`)
- Model file: `server/models/Patient.js`
- Fields:
  - `_id`, `userId` (ObjectId ref `User`, required), `fullName`, `dob`, `gender`, `bloodGroup`, `address`, `city`, `state`, `country`, `contact`, `email`, `emergencyContact`
  - `govId` (Buffer + contentType), `kinConsent`, `regId`, `regDate`, `regPlace`, `profileImage`
  - `createdAt` (Date)

Notes:
- No explicit indexes declared in the model file besides defaults by MongoDB.

## `DonationRequest` (collection: `donationrequests`)
- Model file: `server/models/DonationRequest.js`
- Fields:
  - `_id`, `donor` (ObjectId ref `User`, required), `email` (required), `organ` (enum: Kidney|Liver|Heart|Cornea, required)
  - `tests` (array of testReport { label, value, fileUrl })
  - `consent` (Boolean required), `status` (enum: Pending, Verified, Donated, Rejected; default Pending)
  - `adminRemarks`, `donatedAt` (Date), `donationDetails` (Mixed)
  - `createdAt`, `updatedAt` (Date)

- Indexes/behavior:
  - pre-save hook updates `updatedAt`.

## `PatientRequest` (collection: `patientrequests`)
- Model file: `server/models/PatientRequest.js`
- Fields:
  - `_id`, `patient` (ObjectId ref `User`, required), `organ` (String required)
  - `tests` (Array), `consent` (Boolean), `status` (String default `Pending`)
  - `matchScore` (Number), `matchDonor` (ObjectId ref `User`)
  - `bestMatchDonor` (embedded object with donorId, name, email, city, state, bloodGroup, matchScore, matchPercentage)
  - `mlError` (String), `createdAt`, `updatedAt`

## `Match` (collection: `matches`)
- Model file: `server/models/Match.js`
- Fields:
  - `_id`, `patient` (ObjectId ref `User`, required), `donor` (ObjectId ref `User`, required)
  - `organ` (enum: Kidney, Liver, Heart, Cornea, required)
  - `status` (enum: pending|approved|rejected, default pending)
  - `matchedAt` (Date default now), `updatedAt` (Date)

- Indexes/behavior:
  - pre-save hook updates `updatedAt`.

## `Otp` (collection: `otps`)
- Model file: `server/models/Otp.js`
- Fields:
  - `_id`, `email` (String required), `code` (String required), `expiresAt` (Date required), `verified` (Boolean default false)

## `Document` (collection: `documents`)
- Model file: `server/models/Document.js`
- Fields:
  - `_id`, `user` (ObjectId ref `User`, required), `type` (String required)
  - `fileUrl` (String), `title`, `description`, `organ` (String), `details` (Mixed)
  - `files` (array of file objects: fileUrl, originalName, mimeType, size)
  - `tests` (array of { label, value, fileUrl })
  - `status` (enum: pending|approved|donated|rejected, default pending)
  - `uploadedAt` (Date), plus timestamps enabled (createdAt/updatedAt)

## Derived indexes and TTLs observed in code
- `User` index: `{ email: 1, role: 1 }` unique
- `Donor` index: `{ userId: 1 }` unique; `regId` unique sparse
- No explicit TTL index present in model files. Consider adding TTL on `Otp.expiresAt` or create background job to remove expired OTPs. The `Otp` model tracks `expiresAt` but no TTL index is defined in code.

## Gaps / recommendations (based on code)
- Add explicit TTL index for `Otp` collection: `db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })`.
- Consider adding indexes on commonly queried fields like `DonationRequest.organ`, `PatientRequest.organ`, `Match.status`, and compound indexes reflecting query patterns.
- Add geo fields and `2dsphere` index if proximity-based matching is required (not present in current models).
- Add `migrations` collection or mechanism if schema evolution is expected.

If you want, I can now:
- insert these model-derived details into `DB_SCHEMA.md` (merge), or
- generate an ER diagram (Mermaid) from this mapping and add `Images/er-diagram.png`.
