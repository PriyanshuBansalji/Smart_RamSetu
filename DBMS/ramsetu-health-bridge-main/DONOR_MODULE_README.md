# Donor Module - Ram Setu Organ Donation System

## 📋 Overview

The Donor Module is a dedicated platform for organ donors to register their donation intent, provide medical information, and track their donation status. Donors can manage their health profile, receive updates on matched patients, and contribute to saving lives through organ transplantation.

---

## 👤 Donor User Types

### 1. **Living Donor**
- Donates one organ while alive
- Typically: Kidney, Liver (partial), Bone marrow
- Can donate to relative or stranger
- Regular health monitoring required

### 2. **Deceased Donor**
- Family authorizes donation after death
- Can donate multiple organs
- Registered before or declared after death
- Family consent documentation

### 3. **Altruistic Donor**
- Donates to unknown recipient
- No family preference
- Higher impact on strangers
- Recognized as hero donor

### 4. **Living Related Donor**
- Donates to family member
- Blood relation or spouse
- Simpler matching process
- Established medical history

---

## 🔄 Complete Donor Workflow

### Stage 1: Registration & Profile Creation

#### Step 1a: Signup
```
Visit Platform
    ↓
Click "Register as Donor"
    ↓
Enter Email Address
    ↓
Create Password (8+ chars, uppercase, number)
    ↓
Receive Verification Email
    ↓
Verify Email (Click link)
    ↓
Account Created
Status: EMAIL_VERIFIED
```

#### Step 1b: Personal Information
```
Enter Full Name
    ↓
Select Gender (Male/Female/Other)
    ↓
Enter Date of Birth
    ↓
System Calculates Age
    ↓
Enter Phone Number
    ↓
Enter Address
├─ Street
├─ City
├─ State
├─ Country
└─ Postal Code
    ↓
Save Details
Status: BASIC_INFO_COMPLETE
```

#### Step 1c: Health Information
```
Enter Blood Group
├─ A+, A-, B+, B-
├─ O+, O-, AB+, AB-
    ↓
Health Metrics
├─ Height (cm)
├─ Weight (kg)
├─ Blood Pressure
└─ BMI (Auto-calculated)
    ↓
Medical History
├─ Chronic Diseases
├─ Allergies
├─ Past Surgeries
├─ Current Medications
└─ Lifestyle Habits
    ↓
Save Medical Info
Status: MEDICAL_INFO_COMPLETE
```

#### Step 1d: Donation Details
```
Select Organ to Donate
├─ Kidney (one kidney)
├─ Liver (partial lobe)
├─ Bone Marrow
└─ Cornea
    ↓
Set Donation Preference
├─ Any patient
├─ Family member only
└─ Altruistic donation
    ↓
Upload Medical Documents
├─ Blood test reports
├─ Health check-up
├─ Test reports
└─ Doctor's letter
    ↓
Provide Consent
    ↓
Accept Terms & Conditions
    ↓
Submit Profile
Status: PENDING_VERIFICATION
```

### Stage 2: Verification

#### Step 2a: Document Verification
```
Admin Receives Submission
    ↓
Review Documents:
├─ Identity proof
├─ Blood test results
├─ Medical reports
├─ Doctor's recommendation
└─ Consent form
    ↓
Validate Completeness
    ↓
Check Medical Eligibility
```

#### Step 2b: Health Assessment
```
Medical Team Reviews:
├─ Blood work (CBC, Chemistry, HIV, Hepatitis)
├─ Organ-specific tests
├─ ECG/Ultrasound (if needed)
├─ Age & health status
└─ Risk assessment
    ↓
Medical Clearance
    ↓
Status: VERIFIED
```

#### Step 2c: Donor Activation
```
Donor Receives Notification:
├─ Email confirmation
├─ Account activated
├─ Profile verified
└─ Ready for matching
    ↓
Status: ACTIVE
```

### Stage 3: Matching Process

#### Step 3a: Compatibility Search
```
Donor Organ Available (Organ: Kidney)
    ↓
System Searches Patients
├─ Blood type match
├─ Age compatibility
├─ Health status
├─ Urgency level
└─ Organ quality fit
    ↓
Match Generated (Compatibility: 92%)
    ↓
Status: MATCHED
```

#### Step 3b: Donor Notification
```
Donor Receives Alert:
├─ Email notification
├─ In-app notification
├─ SMS (if enabled)
    ↓
Contains:
├─ Match found confirmation
├─ Recipient details (anonymous)
├─ Compatibility score
├─ Next steps
└─ Timeline expectations
```

#### Step 3c: Donor Decision
```
Donor Reviews Information
    ↓
Options:
├─ Accept Match
│  └─ Proceed to verification
├─ Reject Match
│  └─ Remain in pool for other matches
└─ Defer Decision
    └─ Review later
```

### Stage 4: Final Verification

#### Step 4a: Pre-Transplant Tests
```
Donor Attends Hospital
    ↓
Undergoes:
├─ Physical examination
├─ Blood tests (Final)
├─ Imaging (Ultrasound/CT)
├─ ECG/EEG tests
├─ Psychological evaluation
└─ Doctor consultation
    ↓
Results Review
    ↓
Medical Clearance Given
```

#### Step 4b: Legal & Consent
```
Informed Consent Discussion
    ↓
Review:
├─ Risks & benefits
├─ Recovery timeline
├─ Lifestyle changes
├─ Follow-up requirements
└─ Legal implications
    ↓
Sign Legal Documents
    ↓
Consent Verified
```

#### Step 4c: Final Approval
```
Admin Final Review
    ↓
Check:
├─ All tests complete
├─ Medical clearance obtained
├─ Consent documented
└─ No contraindications
    ↓
Status: VERIFIED_FOR_TRANSPLANT
```

### Stage 5: Transplant Surgery

#### Step 5a: Pre-Operative
```
Surgery Day - T-1
    ↓
Donor:
├─ Fasting (8+ hours)
├─ Hospital admission
├─ Pre-op medications
├─ Vital sign check
└─ Final clearance
```

#### Step 5b: Surgery
```
Surgery Day - T+0
    ↓
Anesthesia
    ↓
Organ Extraction
├─ Standard procedure
├─ Organ preservation
├─ Time: 2-4 hours
└─ Minimal scarring
    ↓
Recovery Room
    ↓
Intensive Care
```

#### Step 5c: Post-Operative
```
Day 1-3: Hospital (ICU)
├─ Vital monitoring
├─ Pain management
├─ Mobility exercises
└─ Wound care

Day 4-7: Hospital (Ward)
├─ Regular monitoring
├─ Physiotherapy
├─ Medication adjustment
└─ Discharge planning

Week 2-4: Home Recovery
├─ Rest & activity increase
├─ Wound check
├─ Medication compliance
└─ Diet management

Week 4-6: Follow-up Visits
├─ Doctor consultation
├─ Lab tests
├─ Stitch removal
└─ Activity resumption
```

### Stage 6: Post-Donation Monitoring

#### Step 6a: Health Monitoring
```
Month 1: Weekly Check-ups
    ↓
Month 2-3: Bi-weekly Check-ups
    ↓
Month 4-6: Monthly Check-ups
    ↓
Year 1: Quarterly Check-ups
    ↓
Year 2+: Annual Check-ups
```

#### Step 6b: Lifestyle Management
```
After Recovery:
├─ Normal activities resume
├─ Exercise possible
├─ Diet resumption
├─ Work resumption
└─ Regular monitoring continues
```

#### Step 6c: Status Update
```
Transplant Successful
    ↓
Status: COMPLETED
    ↓
Donor:
├─ Receives completion notification
├─ Gets follow-up schedule
├─ Enrolled in monitoring program
└─ Recognized as life-saver
```

---

## 📊 Donor Data Model

### Donor Profile
```javascript
{
  _id: ObjectId,
  userId: String,
  email: String,
  
  // Personal Information
  name: String,
  fullName: String,
  gender: String,          // Male, Female, Other
  dob: Date,
  age: Number,
  
  // Contact Information
  phone: String,
  contact: String,
  address: String,
  city: String,
  state: String,
  country: String,
  emergencyContact: String,
  
  // Health Information
  bloodGroup: String,      // A+, B-, O+, AB-, etc.
  height: Number,          // cm
  weight: Number,          // kg
  bloodPressure: String,   // e.g., "120/80"
  bmi: Number,             // Auto-calculated
  
  // Medical History
  medicalHistory: String,
  allergies: String,
  diseases: String,
  pastSurgeries: String,
  currentMedications: String,
  lifestyle: String,       // Smoking, alcohol, etc.
  
  // Donation Details
  organToGive: String,     // Kidney, Liver, Bone Marrow, Cornea
  donationPreference: String, // Anyone, Family Only, Altruistic
  donationReason: String,
  
  // Consent & Legal
  consent: Boolean,
  consentDate: Date,
  kinConsent: Boolean,     // Spouse/Guardian consent
  kinName: String,
  kinRelationship: String,
  
  // Registration Details
  regId: String,           // Unique registration ID
  regDate: Date,
  
  // Medical Clearance
  medicallyCleared: Boolean,
  clearanceDate: Date,
  clearedBy: String,
  
  // Status
  status: String,          // Pending, Verified, Active, Transplanted, Inactive
  role: String,            // "donor"
  
  // Donation History
  donationHistory: [{
    _id: ObjectId,
    organ: String,
    donatedDate: Date,
    recipientAge: Number,
    outcome: String        // Success, Partial, Failed
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Request (Organ Offer)
```javascript
{
  _id: ObjectId,
  donorId: ObjectId,
  organ: String,           // Kidney, Liver, Heart, Cornea
  status: String,          // Pending, Verified, Matched, Completed, Rejected
  
  // Organ Details
  organQuality: String,    // Excellent, Good, Fair, Poor
  organTests: {
    labResults: String,    // Blood work results
    imagingResults: String, // Ultrasound/CT findings
    organViability: Number, // 0-100 percentage
    remarks: String
  },
  
  // Donor Health at Time of Request
  healthMetrics: {
    height: Number,
    weight: Number,
    bloodPressure: String,
    bmi: Number
  },
  
  // Medical Assessment
  medicalClearance: Boolean,
  clearedBy: String,
    clearedDate: Date,
  riskLevel: String,       // Low, Medium, High
  
  // Matching
  matchedWith: ObjectId,   // Patient ID
  matchScore: Number,      // 0-100
  
  // Surgery
  surgeryDate: Date,
  surgeryLocation: String,
  surgeon: String,
  anesthesiologist: String,
  
  // Outcome
  outcome: String,         // Success, Partial, Complication, Failed
  recoveryTime: Number,    // Days
  complications: String,
  notes: String,
  
  // Verification
  verifiedBy: ObjectId,
  verificationDate: Date,
  verificationRemarks: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Donor Features & Functionalities

### 1. **Authentication & Registration**

**Signup Process:**
- Email-based registration
- Password security (min 8 chars, uppercase, numbers)
- Email verification via OTP/Link
- Unique email validation
- Account activation

**Login:**
- Email/Password authentication
- JWT token generation
- Session management
- Password reset capability
- "Remember Me" option

```
Entry Point: /register or /login
Status: PENDING → EMAIL_VERIFIED → ACTIVE
```

---

### 2. **Profile Management**

**Complete Profile:**
- ✓ Personal details (Name, Gender, DOB)
- ✓ Contact information
- ✓ Blood group
- ✓ Health metrics (Height, Weight, BP)
- ✓ Medical history
- ✓ Lifestyle information
- ✓ Consent documentation

**Edit Profile:**
- ✓ Update personal information
- ✓ Modify contact details
- ✓ Update health metrics
- ✓ Change medical history
- ✓ Update lifestyle information

**Profile Validation:**
- Email format & uniqueness
- Phone number validation
- Date of birth validation (age > 18)
- Blood group validation
- Health metrics ranges

```
GET    /api/donor/profile
PUT    /api/donor/profile/update
GET    /api/donor/profile/completeness  // Check % complete
```

---

### 3. **Donation Registration**

**Register to Donate:**

**Step 1: Select Organ**
```
Choose organ type:
├─ Kidney (Most common)
├─ Liver (Partial lobe)
├─ Bone Marrow
└─ Cornea
```

**Step 2: Donation Preference**
```
Who can receive?
├─ Anyone (Altruistic)
├─ Family member only
└─ Specific person
```

**Step 3: Medical Information**
```
Provide:
├─ Current health status
├─ Medications
├─ Allergies
├─ Disease history
└─ Lifestyle habits
```

**Step 4: Document Upload**
- Blood test report (CBC, Chemistry)
- Health check-up report
- Doctor's recommendation letter
- Identity proof
- Consent form (signed)

**Step 5: Consent**
```
Review & Accept:
├─ Medical risks & benefits
├─ Recovery timeline
├─ Lifestyle changes
├─ Transplant procedure details
├─ Follow-up requirements
└─ Legal implications
```

**Step 6: Submit**
```
Final Review
    ↓
Confirm Submission
    ↓
Receive Confirmation
    ↓
Status: PENDING_VERIFICATION
```

```
POST   /api/donor/donation-request/create
GET    /api/donor/donation-request/{id}
PUT    /api/donor/donation-request/{id}/update
POST   /api/donor/donation-request/{id}/upload
```

---

### 4. **Document Management**

**Uploadable Documents:**
- Blood test reports (PDF/JPG)
- Ultrasound/CT scan reports
- Health checkup summary
- Doctor's recommendation
- Identity proof (optional)
- Medical history document
- Any other medical reports

**Document Features:**
- File size limit: 10MB per file
- Allowed formats: PDF, JPG, PNG
- Antivirus scanning
- Encryption in storage
- Secure access control
- Version history tracking

```
POST   /api/document/upload
GET    /api/document/{donorId}
DELETE /api/document/{docId}
```

---

### 5. **Match Tracking & Notifications**

**View Matches:**
- Current match status
- Patient information (anonymous)
- Compatibility score
- Medical requirements
- Timeline estimates

**Match Status Updates:**
```
MATCHED Found
    ↓
VERIFIED by admin
    ↓
APPROVED for surgery
    ↓
TRANSPLANTED (done)
    ↓
COMPLETED (recovered)
```

**Match Notifications:**
- Email alert when match found
- SMS notification (if enabled)
- In-app notification
- Updates on match status
- Surgery schedule notification
- Post-surgery follow-up

```
GET    /api/match/donor/{donorId}
GET    /api/match/{matchId}/details
PUT    /api/match/{matchId}/accept
PUT    /api/match/{matchId}/decline
```

---

### 6. **Medical History Tracking**

**Health Record Features:**
- Complete medical history
- Allergy documentation
- Past surgeries with dates
- Current medications list
- Disease history
- Lab results storage
- Vaccination records

**Health Monitoring:**
- Health metrics trends
- Blood pressure tracking
- Weight history
- Post-donation vitals
- Recovery progress

```
GET    /api/donor/medical-history
POST   /api/donor/health-metrics/add
GET    /api/donor/health-metrics/timeline
```

---

### 7. **Consent Management**

**Types of Consent:**

1. **Medical Consent**
   - For surgical procedure
   - Risk acknowledgment
   - Informed decision

2. **Data Consent**
   - Information sharing with hospital
   - Research use (optional)
   - Contact information usage

3. **Follow-up Consent**
   - Long-term health monitoring
   - Appointment scheduling
   - Health updates tracking

**Consent Documentation:**
```
Consent Form Includes:
├─ Medical procedure details
├─ Risks & benefits
├─ Recovery information
├─ Follow-up requirements
├─ Lifestyle changes
├─ Legal statement
├─ Donor signature
├─ Date & time
└─ Witness signature (optional)
```

```
POST   /api/consent/create
GET    /api/consent/{donorId}
PUT    /api/consent/{id}/update
```

---

### 8. **Emergency Contact Management**

**Emergency Contact Details:**
- Primary contact name
- Relationship (Spouse, Parent, Sibling, Friend)
- Phone number
- Address
- Secondary contact (optional)

**Emergency Contact Usage:**
- Medical emergency notification
- Surgery information communication
- Post-operative updates
- Recovery assistance
- Authorization for decisions

```
POST   /api/emergency-contact/add
GET    /api/emergency-contact/{donorId}
PUT    /api/emergency-contact/{id}/update
```

---

### 9. **Appointment & Surgery Scheduling**

**Appointment Management:**

**Before Surgery:**
- Medical tests appointment
- Doctor consultation
- Hospital visit scheduling
- Pre-op evaluation

**Surgery Day:**
- Date & time confirmation
- Hospital location & address
- Arrival time requirement
- Fasting instructions
- Medication instructions

**Post-Surgery:**
- Follow-up appointments (Weekly × 4 weeks)
- Monthly check-ups (3 months)
- Quarterly visits (1 year)
- Annual check-ups (Long-term)

```
GET    /api/appointment/donor/{donorId}
POST   /api/appointment/create
PUT    /api/appointment/{id}/confirm
PUT    /api/appointment/{id}/reschedule
```

---

### 10. **Recovery Tracking**

**Post-Donation Recovery:**

**Week 1-2:**
- Hospital stay (1-2 days)
- Pain management
- Mobility exercises
- Wound care
- Medication compliance

**Week 2-4:**
- Home recovery
- Gradual activity increase
- Wound healing monitoring
- Follow-up visits
- Stitch removal

**Month 2-3:**
- Return to light activities
- Gradual work resumption
- Regular check-ups
- Lab tests
- Dietary adjustments

**Month 4-12:**
- Full recovery achieved
- Return to normal activities
- Annual follow-up schedule
- Long-term monitoring begins

**Recovery Metrics:**
- Pain levels (1-10 scale)
- Energy levels
- Appetite status
- Sleep quality
- Activity tolerance

```
POST   /api/donor/recovery/update
GET    /api/donor/recovery/timeline
GET    /api/donor/recovery/milestones
```

---

### 11. **Notification System**

**Notification Types:**

| Event | Channel | Content |
|-------|---------|---------|
| Registration Confirmation | Email | Account activation |
| Profile Verified | Email | Ready to donate |
| Match Found | Email + SMS + In-App | Patient matched |
| Match Approved | Email | Surgery scheduled |
| Appointment Reminder | SMS + Email | Pre-op date/time |
| Surgery Scheduled | Email | Final confirmation |
| Surgery Complete | SMS + Email | Success notification |
| Recovery Update | Email | Follow-up schedule |
| Appointment Due | SMS | Check-up reminder |
| Final Report | Email | Complete summary |

```
GET    /api/notification/donor/{donorId}
PUT    /api/notification/{id}/read
DELETE /api/notification/{id}
```

---

## 📡 Donor Data Flow

```
┌─────────────────────────────────────────────────┐
│       Donor Portal / Mobile App                  │
└────────┬────────────────────────────────────────┘
         │
         ├─► REGISTRATION & AUTHENTICATION
         │   ├─ Email signup
         │   ├─ Password setup
         │   ├─ Email verification
         │   └─ Account activation
         │
         ├─► PROFILE COMPLETION
         │   ├─ Personal information
         │   ├─ Blood group entry
         │   ├─ Health metrics
         │   └─ Medical history
         │
         ├─► DONATION REGISTRATION
         │   ├─ Organ selection
         │   ├─ Donation preference
         │   ├─ Medical details entry
         │   ├─ Document upload
         │   └─ Consent acceptance
         │
         ├─► SUBMISSION & REVIEW
         │   ├─ Request submitted
         │   ├─ Admin receives notification
         │   └─ Status: PENDING_VERIFICATION
         │
         ├─► VERIFICATION PROCESS
         │   ├─ Document check
         │   ├─ Medical assessment
         │   ├─ Background verification
         │   └─ Status: VERIFIED/ACTIVE
         │
         ├─► MATCHING ENGINE
         │   ├─ Search for patients
         │   ├─ Blood type matching
         │   ├─ HLA typing
         │   ├─ Organ quality assessment
         │   └─ Compatibility scoring
         │
         ├─► MATCH FOUND
         │   ├─ Donor receives notification
         │   ├─ Match details provided
         │   ├─ Patient info (anonymous)
         │   └─ Donor accepts/rejects
         │
         ├─► PRE-TRANSPLANT VERIFICATION
         │   ├─ Final medical tests
         │   ├─ Psychological evaluation
         │   ├─ Informed consent review
         │   └─ Status: READY_FOR_SURGERY
         │
         ├─► SURGERY COORDINATION
         │   ├─ Surgery date scheduling
         │   ├─ Hospital admission
         │   ├─ Pre-op preparations
         │   └─ Surgery execution
         │
         ├─► POST-OPERATIVE CARE
         │   ├─ Hospital recovery (ICU)
         │   ├─ Ward recovery
         │   ├─ Home recovery
         │   └─ Follow-up visits
         │
         └─► LONG-TERM MONITORING
             ├─ Regular health check-ups
             ├─ Lab tests
             ├─ Doctor consultations
             └─ Lifestyle management

         │
         ▼
┌─────────────────────────────────────────────────┐
│    Backend API (Node.js/Express)                │
│  ├─ Request validation                          │
│  ├─ Blood type matching                         │
│  ├─ Compatibility calculation                   │
│  ├─ Document verification                       │
│  └─ Notification triggering                     │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│   Admin Module (Verification & Approval)        │
│  ├─ Document review                             │
│  ├─ Status updates                              │
│  ├─ Match approval                              │
│  └─ Surgery coordination                        │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│    MongoDB Database                             │
│  ├─ Donor profiles                              │
│  ├─ Donation requests                           │
│  ├─ Medical records                             │
│  ├─ Matches                                     │
│  ├─ Appointments                                │
│  ├─ Notifications                               │
│  └─ Recovery tracking                           │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│   Notification Engine                           │
│  ├─ Email Service                               │
│  ├─ SMS Service                                 │
│  └─ Push Notifications                          │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Typical Donor Journey Timeline

### Week 1: Registration & Profile
```
Day 1  - Signup & email verification
Day 2  - Complete personal profile
Day 3  - Enter health information
Day 4  - Register donation intent
Day 4  - Upload documents
Day 5  - Submit for verification
Status: PENDING_VERIFICATION
```

### Week 2-3: Verification
```
Day 8  - Admin reviews documents
Day 9  - Medical team assessment
Day 10 - Final verification approval
Day 10 - Status updated to ACTIVE
Status: ACTIVE
```

### Week 4-8: Waiting for Match
```
Day 15 - Profile active in system
Day 22 - First potential match found
Day 23 - Donor receives notification
Day 24 - Donor accepts match
Status: MATCHED
```

### Week 9-10: Pre-Transplant
```
Day 57 - Final medical tests
Day 58 - Psychological evaluation
Day 59 - Final consultation
Day 60 - Surgery date confirmed
Status: READY_FOR_SURGERY
```

### Week 11: Surgery & Recovery
```
Day 63 - Hospital admission
Day 63 - Surgery performed
Day 64 - ICU recovery
Day 65 - Ward transfer
Day 66 - Hospital discharge
Status: TRANSPLANTED
```

### Week 12-16: Recovery
```
Week 12 - Home recovery begins
Week 13 - First follow-up visit
Week 14 - Stitch removal
Week 15 - Second follow-up
Week 16 - Clear for work
Status: COMPLETED
```

---

## 📋 API Endpoints for Donors

### Authentication
```
POST   /api/auth/register              - Register as donor
POST   /api/auth/login                 - Donor login
POST   /api/auth/verify-email          - Verify email OTP
POST   /api/auth/logout                - Logout
POST   /api/auth/forgot-password       - Password reset
```

### Profile
```
GET    /api/donor/profile              - Get profile
PUT    /api/donor/profile/update       - Update profile
GET    /api/donor/profile/completeness - Check completeness %
```

### Donation Registration
```
POST   /api/donor/donation-request/create   - Register donation
GET    /api/donor/donation-request/{id}     - Get request
PUT    /api/donor/donation-request/{id}     - Update request
POST   /api/donor/donation-request/{id}/upload - Upload docs
GET    /api/donor/donation-request/all      - Get all requests
```

### Matches
```
GET    /api/match/donor/{donorId}           - Get matches
GET    /api/match/{matchId}/details         - Get match details
PUT    /api/match/{matchId}/accept          - Accept match
PUT    /api/match/{matchId}/decline         - Decline match
```

### Medical Records
```
GET    /api/donor/medical-history           - Get medical history
POST   /api/donor/health-metrics/add        - Add health metrics
GET    /api/donor/health-metrics/timeline   - Get timeline
```

### Appointments
```
GET    /api/appointment/donor/{donorId}     - Get appointments
PUT    /api/appointment/{id}/confirm        - Confirm appointment
```

### Notifications
```
GET    /api/notification/donor/{donorId}    - Get notifications
PUT    /api/notification/{id}/read          - Mark as read
```

---

## 🔒 Security & Privacy

### Data Protection
- ✓ Encryption in transit (HTTPS)
- ✓ Encrypted database storage
- ✓ Password hashing (bcrypt)
- ✓ JWT token authentication
- ✓ Secure file upload/storage

### Privacy Measures
- ✓ Anonymous recipient information
- ✓ Limited data sharing
- ✓ Confidentiality agreements
- ✓ Access logging
- ✓ Data retention policies

### Compliance
- ✓ Medical confidentiality laws
- ✓ Transplant regulations
- ✓ Informed consent requirements
- ✓ GDPR compliance
- ✓ Legal documentation

---

## ⚠️ Validation Rules

### Registration
- Email: Valid format, unique
- Password: Min 8 chars, 1 uppercase, 1 number
- Age: Must be 18-65 years
- Phone: Valid format

### Profile
- Blood Group: A+, A-, B+, B-, O+, O-, AB+, AB-
- Height: 150-220 cm
- Weight: 45-150 kg
- Blood Pressure: Valid format (systolic/diastolic)

### Medical Eligibility
- No HIV/Hepatitis B/C
- No active cancer
- No severe cardiac disease
- No uncontrolled diabetes
- No severe liver/kidney disease

---

## 📊 Important Milestones & Timelines

| Milestone | Time | Status |
|-----------|------|--------|
| Registration | Day 0 | PENDING_VERIFICATION |
| Email Verification | Day 0-1 | EMAIL_VERIFIED |
| Profile Completion | Day 1-3 | PROFILE_COMPLETE |
| Document Submission | Day 4-5 | PENDING_VERIFICATION |
| Admin Verification | Day 8-10 | VERIFIED |
| Activation | Day 10 | ACTIVE |
| Match Found | Day 15-60 | MATCHED |
| Final Testing | Day 57-59 | TESTING |
| Ready for Surgery | Day 60 | READY_FOR_SURGERY |
| Surgery | Day 63 | TRANSPLANTED |
| Recovery Complete | Day 63-90 | COMPLETED |

---

## 🎯 Best Practices for Donors

1. **Complete Profile Thoroughly**
   - Accurate health information
   - Complete medical history
   - Correct contact details
   - Updated emergency contacts

2. **Provide Quality Documents**
   - Clear, recent medical reports
   - Complete blood test results
   - Doctor's recommendations
   - Readable document uploads

3. **Stay Informed**
   - Check notifications regularly
   - Review match details carefully
   - Ask questions before accepting
   - Understand procedure & risks

4. **Follow Medical Instructions**
   - Attend all appointments
   - Complete all tests
   - Follow pre-surgery guidelines
   - Adhere to post-op care

5. **Maintain Health**
   - Healthy lifestyle
   - Regular exercise
   - Balanced diet
   - Avoid smoking/alcohol
   - Keep medications updated

---

## 📞 Donor Support & Help

**Support Options:**
- Live chat in app
- Email: donor-support@ramsetu.com
- Phone: +91-XXX-XXXX-XXXX
- Video guides
- FAQs section

**Common Questions:**
- What organs can I donate?
- Who can be a donor?
- What tests are needed?
- How long is recovery?
- Will it affect my health?
- Will I know who received my organ?
- What is the cost?
- Are there insurance benefits?

---

## 🏆 Donor Recognition Program

**Donor Badges:**
- Gold Badge: First-time donor
- Platinum Badge: Multiple donors
- Hero Badge: Altruistic donor
- Champion Badge: Advocate/Referrer

**Benefits:**
- Certificate of appreciation
- Media recognition (optional)
- Lifetime health monitoring
- Priority for own transplant needs
- Spouse/children donation priority

---

**Last Updated:** December 2025  
**Version:** 1.0 - Donor Module Documentation
