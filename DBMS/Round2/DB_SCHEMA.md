# Database Schema — RamSetu Health Bridge (MongoDB)

This document describes the recommended MongoDB schema (collections), sample fields, indexes, TTLs, sharding guidance, and retention/backups for the RamSetu system.

Notes:
- The system uses MongoDB (managed, e.g., MongoDB Atlas) as the primary datastore. Collections below are guidelines — schema-less documents allow flexibility but use validation where possible.
- Use collection-level JSON Schema validation for critical fields to avoid garbage data.

---

**Collections overview**

1. `users`
  - Purpose: global user records (donors, patients, admins, general users)
  - Sample fields:
    - `_id` (ObjectId)
    - `userId` (string, uuid) — application id
    - `role` (enum: `donor`|`patient`|`admin`|`system`)
    - `email` (string)
    - `phone` (string)
    - `passwordHash` (string)
    - `profile` (object) — small profile fields (name, dob, gender)
    - `createdAt` (date), `updatedAt` (date)
    - `status` (enum: `active`|`suspended`|`deleted`)
  - Indexes:
    - `{ email: 1 }` unique (sparse/partial if social login allowed)
    - `{ userId: 1 }` unique
    - `{ phone: 1 }` (optional, unique)

2. `donors`
  - Purpose: donor medical/address records and donation metadata
  - Sample fields:
    - `_id`, `donorId` (uuid)
    - `userRef` (ObjectId or `userId`)
    - `medicalProfile` (object) — bloodGroup, HLA, comorbidities, labs
    - `consent` (object) — consent status, timestamps
    - `location` (geoJSON) — used for proximity matching
    - `organs` (array) — list of organs registered
    - `createdAt`, `updatedAt`
  - Indexes:
    - `{ userRef: 1 }`
    - `{ "medicalProfile.bloodGroup": 1 }`
    - `{ location: "2dsphere" }` for geospatial queries
    - Compound indexes for matching common queries, e.g. `{ "medicalProfile.bloodGroup": 1, "medicalProfile.hla": 1 }`

3. `patients`
  - Purpose: patient details and transplant requests
  - Sample fields:
    - `_id`, `patientId`, `userRef`
    - `medicalCondition` (object) — organ needed, urgency, compatibility requirements
    - `hospital` (object) — name, location
    - `requestHistory` (array)
    - `createdAt`, `updatedAt`
  - Indexes:
    - `{ patientId: 1 }`
    - `{ "medicalCondition.organ": 1, "medicalCondition.urgency": 1 }`

4. `donationRequests` (or `donation_requests`)
  - Purpose: donor-side donation events or pledges
  - Sample fields:
    - `_id`, `requestId`, `donorRef` (donorId), `status` (open/closed/cancelled)
    - `requestedOrgans`, `availableFrom`, `notes`
    - `createdAt`, `updatedAt`
  - Indexes:
    - `{ donorRef: 1 }`, `{ status: 1 }`

5. `patientRequests` (or `patient_requests`)
  - Purpose: patient transplant requests
  - Fields:
    - `_id`, `requestId`, `patientRef`, `organNeeded`, `urgency`, `status`
    - `requiredCompatibility` (object), `createdAt`, `updatedAt`
  - Indexes:
    - `{ organNeeded: 1, urgency: -1 }` (sort by urgency)

6. `matches`
  - Purpose: store match attempts and their metadata
  - Fields:
    - `_id`, `matchId`, `donorRef`, `patientRef`
    - `scores` (object) — compatibility score, feature breakdown
    - `matchStatus` (enum: `proposed`|`accepted`|`rejected`|`expired`)
    - `createdAt`, `updatedAt`
  - Indexes:
    - `{ donorRef: 1 }`, `{ patientRef: 1 }`
    - `{ matchStatus: 1, createdAt: -1 }`

7. `otp` (short-lived tokens)
  - Purpose: one-time passwords, short verification tokens
  - Fields:
    - `_id`, `userRef`, `tokenHash`, `purpose` (login|email_verification|password_reset)
    - `createdAt`
  - Indexes / TTL:
    - TTL index on `createdAt` with `expireAfterSeconds` = 300 (5 minutes) or as desired

8. `documents` / `uploads`
  - Purpose: metadata for file uploads (medical reports, scanned consent)
  - Fields:
    - `_id`, `ownerRef`, `fileName`, `mimeType`, `storageUrl`, `size`, `createdAt`
  - Indexes:
    - `{ ownerRef: 1 }`

9. `notifications` / `email_queue` (optional queue collection)
  - Purpose: queued notifications for workers
  - Fields:
    - `_id`, `type`, `payload`, `status` (pending|sent|failed), `attempts`, `nextAttemptAt`
  - Indexes:
    - `{ status: 1, nextAttemptAt: 1 }`

10. `audit_logs` (optional)
  - Purpose: security and compliance logs (who changed what and when)
  - Fields:
    - `_id`, `actorRef`, `action`, `resourceType`, `resourceId`, `diff`, `createdAt`
  - Indexes:
    - `{ resourceType: 1, resourceId: 1 }`, `{ createdAt: -1 }`

---

**Sample JSON Schema validation (example for `patients`)**
```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["patientId", "userRef", "medicalCondition", "createdAt"],
    "properties": {
      "patientId": { "bsonType": "string" },
      "userRef": { "bsonType": "objectId" },
      "medicalCondition": { "bsonType": "object" },
      "createdAt": { "bsonType": "date" }
    }
  }
}
```

---

**Indexing & query patterns**
- Create indexes for the most common query patterns (match queries, urgency sorting, geospatial proximity). Example heavy queries:
  - Find donors by organ & blood group → compound index `{ "medicalProfile.organs": 1, "medicalProfile.bloodGroup": 1 }`
  - Find donors near hospital → `2dsphere` index on `location`
  - Find recent matches for a patient → `{ patientRef: 1, createdAt: -1 }`

**TTL & retention**
- `otp` collection: TTL of 5–15 minutes.
- `audit_logs`: retention depends on compliance — example: keep 1 year then archive to cold storage.
- `notifications` queue: keep only failed events or metadata; purge sent events older than 30–90 days.
- Uploaded files: keep as per policy; use object storage lifecycle rules to move to cold storage after X days.

**Sharding & scaling**
- For very large datasets and high read/write scale, enable sharding in MongoDB Atlas. Choose shard key carefully:
  - Candidate shard keys: `userId`/`donorId` (for even distribution), or hashed `userId` for write distribution
  - Avoid monotonically increasing keys as shard keys (ObjectId timestamp part may skew writes)
- Use read replicas for analytical/reporting workloads; separate analytics from primary OLTP traffic.

**Backups & recovery**
- Use managed backups (MongoDB Atlas snapshots) with daily snapshots and point-in-time recovery if available.
- Periodically test restores to a staging cluster.

**Migrations & versioning**
- Use migration scripts (node or mongo scripts) for schema changes. Keep migrations idempotent where possible.
- Add a `migrations` collection to record applied migrations and their timestamps.

**Security & encryption**
- Enforce TLS for all connections.
- Enable at-rest encryption via managed provider.
- Limit DB roles to least privilege and rotate credentials.

**Operational notes**
- Monitor index hit ratios and slow queries; add indexes incrementally.
- Use connection pooling on API servers and set appropriate connection limits.
- For heavy ML scoring read patterns, consider a read-optimized cache (Redis) for frequently requested model metadata or prediction results.

---

If you want, I can:
- generate a visual ER diagram (Mermaid or Draw.io) and add it to `Images/er-diagram.png`, or
- scan the repo's `server/models` folder and produce a derived `DB_SCHEMA.md` that maps actual model fields to the collections above.
