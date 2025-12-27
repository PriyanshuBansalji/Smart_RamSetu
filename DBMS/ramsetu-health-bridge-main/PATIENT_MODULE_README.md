# Patient Module - Ram Setu Organ Donation System

## 📋 Overview

The Patient Module is a comprehensive platform for patients requiring organ transplants to register, manage their profiles, and track their donation match requests. Patients can view available matches, provide medical information, and receive updates on their status.

---

## 👤 Patient User Types

### 1. **Recipient Patient**
- Requires organ transplant
- Registers medical needs
- Receives match notifications
- Updates health information

### 2. **Authorized Guardian**
- Can represent patients (minors/incapacitated)
- Manages patient information
- Approves transplant decisions
- Provides consent on behalf of patient

---

## 🔄 Complete Patient Workflow

### Step 1: Registration
```
Patient Signup
    ↓
Email Verification
    ↓
Personal Information Entry
    ↓
Medical History Submission
    ↓
Blood Type Recording
    ↓
Required Organ Selection
    ↓
Account Activation
```

### Step 2: Profile Creation
```
Basic Details (Name, Email, Phone)
    ↓
Demographics (Age, Gender, Address)
    ↓
Medical History (Diseases, Allergies, Surgeries)
    ↓
Health Metrics (Height, Weight, Blood Pressure)
    ↓
Consent Information Entry
    ↓
Emergency Contact Details
    ↓
Profile Complete
```

### Step 3: Organ Request Creation
```
Select Required Organ
    ↓
Medical Details Entry
    ↓
Urgency Level Selection
    ↓
Test Reports Upload
    ↓
Doctor Information
    ↓
Request Submission
    ↓
Request: PENDING
```

### Step 4: Match Processing
```
System Searches Donors
    ↓
Compatibility Check
    ↓
Blood Type Match
    ↓
HLA Typing
    ↓
Organ Suitability
    ↓
Match Found (PENDING)
    ↓
Patient Notification
```

### Step 5: Verification
```
Patient Receives Notification
    ↓
Reviews Donor Details (Anonymous)
    ↓
Medical Team Conducts Tests
    ↓
Admin Verifies Match
    ↓
Match Status: VERIFIED
    ↓
Transplant Planning
```

### Step 6: Transaction Completion
```
Transplant Surgery Scheduled
    ↓
Pre-operative Tests
    ↓
Surgery Execution
    ↓
Post-operative Care
    ↓
Status Updated: COMPLETED/RECEIVED
    ↓
Follow-up Monitoring
```

---

## 📊 Patient Data Model

### Patient Profile
```javascript
{
  _id: ObjectId,
  userId: String,
  email: String,
  name: String,
  fullName: String,
  
  // Demographics
  age: Number,
  gender: String,        // Male, Female, Other
  dob: Date,
  bloodGroup: String,    // A+, B-, O+, AB-, etc.
  
  // Contact
  phone: String,
  contact: String,
  address: String,
  city: String,
  state: String,
  country: String,
  emergencyContact: String,
  
  // Medical Information
  medicalHistory: String,
  allergies: String,
  diseases: String,
  pastSurgeries: String,
  lifestyle: String,
  
  // Health Metrics
  height: Number,        // cm
  weight: Number,        // kg
  bloodPressure: String, // e.g., "120/80"
  
  // Consent & Legal
  kinConsent: Boolean,
  consentDate: Date,
  
  // Registration
  regId: String,
  regDate: Date,
  regPlace: String,
  
  // Status
  status: String,        // Active, Inactive, Transplanted
  role: String,          // "patient"
  
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Request (Organ Request)
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  organ: String,         // Kidney, Liver, Heart, Cornea
  status: String,        // Pending, Verified, Matched, Received
  
  // Medical Details
  medicalDetails: String,
  urgencyLevel: String,  // Low, Medium, High, Critical
  healthMetrics: {
    height: Number,
    weight: Number,
    bloodPressure: String
  },
  
  // Doctor Information
  doctorName: String,
  doctorContact: String,
  hospitalName: String,
  
  // Test Reports
  tests: [{
    label: String,
    value: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  
  // Consent
  consent: Boolean,
  consentDate: Date,
  
  // Admin Remarks
  adminRemarks: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Patient Features & Functionalities

### 1. **Authentication & Registration**

**Registration Process:**
- Email-based registration
- Password security (min 8 chars, uppercase, numbers)
- Email verification via OTP
- Unique email validation
- Account activation

**Login:**
- Email/Password authentication
- JWT token generation
- Session management
- "Remember Me" option
- Password reset via email

```
Entry Point: /register or /login
Status: PENDING → VERIFIED → ACTIVE
```

---

### 2. **Profile Management**

**View Profile:**
- ✓ Personal information display
- ✓ Medical history view
- ✓ Blood type and health metrics
- ✓ Contact information
- ✓ Consent status

**Edit Profile:**
- ✓ Update name, email, phone
- ✓ Modify address information
- ✓ Update medical history
- ✓ Change health metrics
- ✓ Add emergency contact

**Data Validation:**
- Email format validation
- Phone number validation
- Date of birth validation (age > 18)
- Blood group validation (A+, B-, O+, AB-)

```
GET /api/patient/profile
PUT /api/patient/profile/update
```

---

### 3. **Organ Request Management**

**Create Request:**
1. Select organ needed (Kidney, Liver, Heart, Cornea)
2. Enter medical details
3. Set urgency level
4. Specify doctor information
5. Upload test reports
6. Accept terms and conditions
7. Submit request

**Request Statuses:**
```
PENDING      → Initial submission
    ↓
VERIFIED     → Admin verified documents
    ↓
MATCHED      → Donor matched with patient
    ↓
RECEIVED     → Organ successfully received
    ↓
COMPLETED    → Follow-up period finished

REJECTED     → Rejected by admin (anytime)
```

**Test Report Upload:**
- Medical reports (PDF/JPG)
- Blood test results
- Ultrasound/CT scans
- ECG/EEG reports
- Doctor recommendations
- File size limit: 10MB
- Allowed formats: PDF, JPG, PNG

```
POST /api/patient/request/create
GET /api/patient/request/{requestId}
PUT /api/patient/request/{requestId}/update
POST /api/patient/request/{requestId}/upload
```

---

### 4. **Match Tracking**

**View Matches:**
- Available donor matches
- Match compatibility score
- Organ suitability
- Donor blood type (anonymous profile)
- Match status in real-time

**Match Notifications:**
- Email notification on match found
- SMS alert (if enabled)
- In-app notification
- Match details and next steps

**Match Status Timeline:**
```
MATCHED FOUND (T+0)
    ↓ Patient Accepts
ADMIN VERIFYING (T+1-2 days)
    ↓ Documents verified
VERIFIED (T+2-3 days)
    ↓ Schedule surgery
TRANSPLANT (T+3-5 days)
    ↓ Surgery completed
RECEIVED (T+6+ days)
    ↓ Recovery monitoring
```

**Match Information:**
- Donor organ details
- Compatibility percentage
- Blood type match
- HLA typing results
- Organ quality score
- Medical recommendations

```
GET /api/match/patient/{patientId}
GET /api/match/{matchId}/details
PUT /api/match/{matchId}/accept
```

---

### 5. **Document Management**

**Upload Documents:**
- Medical reports
- Test results
- Doctor prescriptions
- Hospital records
- Insurance documents
- Identity proof

**Document Organization:**
- Category-wise storage
- Timestamp tracking
- Virus scanning
- File encryption
- Access logs

```
POST /api/document/upload
GET /api/document/{patientId}
DELETE /api/document/{docId}
```

---

### 6. **Notification System**

**Notification Types:**

| Event | Channel | Content |
|-------|---------|---------|
| Registration Confirmation | Email | Account activation link |
| Profile Update | Email | Confirmation of changes |
| Request Submitted | Email | Request ID & status |
| Request Verified | Email + SMS | Document verification complete |
| Match Found | Email + SMS + In-App | Donor matched, next steps |
| Admin Updates | Email | Status changes |
| Surgery Scheduled | SMS + Email | Date, time, location |
| Transplant Complete | SMS + Email | Success notification |
| Appointment Reminder | SMS + Email | Follow-up dates |

```
POST /api/notification/send
GET /api/notification/{patientId}
PUT /api/notification/{notificationId}/read
```

---

### 7. **Medical History Tracking**

**Record Keeping:**
- Disease history (diabetes, hypertension, etc.)
- Allergies documentation
- Past surgeries with dates
- Medication list
- Lifestyle information
- Health metrics timeline

**Health Metrics:**
- Blood pressure history
- Weight tracking
- Height
- BMI calculation
- Blood test results
- Organ-specific metrics

```
GET /api/patient/medical-history/{patientId}
POST /api/patient/health-metrics/add
```

---

### 8. **Consent Management**

**Consent Types:**
1. **Medical Consent** - For organ transplant
2. **Data Consent** - For information sharing
3. **Contact Consent** - For notifications
4. **Kin Consent** - Guardian approval

**Consent Flow:**
```
Patient Reviews Terms
    ↓
Understands Risks
    ↓
Provides Signature
    ↓
Guardian Approval (if needed)
    ↓
Consent Recorded with Date
    ↓
Legal Documentation
```

```
POST /api/consent/create
GET /api/consent/{patientId}
```

---

### 9. **Emergency Contact Management**

**Emergency Contact Details:**
- Primary contact name
- Phone number
- Relationship
- Secondary contact (optional)
- Authorization level

**Usage:**
- Notification during emergencies
- Authorization for medical decisions
- Surgery communication
- Post-transplant follow-up

```
POST /api/emergency-contact/add
PUT /api/emergency-contact/update
```

---

## 📡 Patient Data Flow

```
┌─────────────────────────────────────────────────────┐
│         Patient Portal / Mobile App                  │
└────────┬────────────────────────────────────────────┘
         │
         ├─► REGISTRATION & AUTHENTICATION
         │   ├─ Email verification
         │   ├─ Password setup
         │   └─ Profile activation
         │
         ├─► PROFILE MANAGEMENT
         │   ├─ Personal info entry
         │   ├─ Medical history
         │   └─ Health metrics
         │
         ├─► ORGAN REQUEST CREATION
         │   ├─ Select organ
         │   ├─ Medical details
         │   ├─ Urgency level
         │   └─ Test upload
         │
         ├─► REQUEST STATUS TRACKING
         │   ├─ PENDING status
         │   ├─ Admin verification
         │   └─ Status updates
         │
         ├─► MATCH NOTIFICATIONS
         │   ├─ Match found alert
         │   ├─ Donor details (anonymous)
         │   └─ Compatibility info
         │
         ├─► MATCH ACCEPTANCE
         │   ├─ Review match details
         │   ├─ Accept/Reject match
         │   └─ Schedule surgery
         │
         └─► FOLLOW-UP & RECOVERY
             ├─ Post-transplant care
             ├─ Appointment tracking
             └─ Health monitoring

         │
         ▼
┌─────────────────────────────────────────────────────┐
│        Backend API (Node.js/Express)                │
│  ┌───────────────────────────────────────────────────┐
│  │  REQUEST PROCESSING & VALIDATION                  │
│  │  ├─ Data validation                               │
│  │  ├─ Blood type matching                           │
│  │  ├─ HLA typing analysis                           │
│  │  └─ Compatibility scoring                         │
│  └───────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│     Admin Module (Verification & Matching)          │
│  ├─ Document verification                           │
│  ├─ Request approval                                │
│  ├─ Match confirmation                              │
│  └─ Status updates                                  │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│        MongoDB Database                             │
│  ├─ Patient profiles                                │
│  ├─ Patient requests                                │
│  ├─ Medical records                                 │
│  ├─ Matches                                         │
│  ├─ Notifications                                   │
│  └─ Consent records                                 │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│    Notification Engine                              │
│  ├─ Email Service                                   │
│  ├─ SMS Service                                     │
│  └─ Push Notifications                              │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Typical Patient Journey Timeline

### Day 1: Registration
```
09:00 AM  - Patient visits platform
09:15 AM  - Creates account with email
09:30 AM  - Verifies email (OTP)
09:45 AM  - Completes profile (1st session)
10:30 AM  - Receives confirmation email
Status: ACTIVE
```

### Day 2-3: Medical Details
```
14:00 - Patient uploads medical reports
14:30 - Creates organ request (Kidney)
14:45 - Sets urgency level (High)
15:00 - Submits request
Status: PENDING
```

### Day 4-7: Verification
```
Day 4, 10:00 AM  - Admin reviews documents
Day 4, 14:00 PM  - Admin verifies completeness
Day 5, 09:00 AM  - Request marked VERIFIED
Day 5, 10:00 AM  - Patient receives email
Status: VERIFIED
```

### Day 8-15: Matching
```
Day 8  - Donor registered with compatible kidney
Day 9  - System runs matching algorithm
Day 10 - Match found (Score: 95%)
Day 10, 14:00 - Patient receives notification
Day 10, 15:00 - Patient accepts match
Status: MATCHED
```

### Day 16-21: Final Verification
```
Day 16 - Admin conducts final verification
Day 18 - HLA typing confirmed
Day 20 - Surgery scheduled
Status: VERIFIED FOR TRANSPLANT
```

### Day 22+: Transplant
```
Day 22 - Pre-operative tests
Day 23 - Surgery performed
Day 24 - Patient in recovery
Day 24 - Status updated to RECEIVED
Status: COMPLETED
```

---

## 📋 API Endpoints for Patients

### Authentication
```
POST   /api/auth/register              - Register new patient
POST   /api/auth/login                 - Patient login
POST   /api/auth/verify-email          - Verify email OTP
POST   /api/auth/logout                - Logout
POST   /api/auth/forgot-password       - Password reset
```

### Profile
```
GET    /api/patient/profile            - Get profile details
PUT    /api/patient/profile/update     - Update profile
DELETE /api/patient/profile            - Delete account
```

### Organ Requests
```
POST   /api/patient/request/create     - Create organ request
GET    /api/patient/request/{id}       - Get request details
PUT    /api/patient/request/{id}       - Update request
GET    /api/patient/requests           - Get all requests
POST   /api/patient/request/{id}/upload - Upload documents
```

### Matches
```
GET    /api/match/patient/{patientId}  - Get patient matches
GET    /api/match/{matchId}            - Get match details
PUT    /api/match/{matchId}/accept     - Accept match
```

### Medical Records
```
GET    /api/patient/medical-history    - Get medical history
POST   /api/patient/health-metrics     - Add health metrics
```

### Notifications
```
GET    /api/notification/patient       - Get notifications
PUT    /api/notification/{id}/read     - Mark as read
```

---

## 🔒 Security & Privacy

### Data Protection
- ✓ Encryption in transit (HTTPS)
- ✓ Encryption at rest (Database)
- ✓ Password hashing (bcrypt)
- ✓ JWT token authentication
- ✓ Role-based access control

### Privacy Measures
- ✓ Patient anonymity in donor interface
- ✓ Limited data access
- ✓ Audit logging
- ✓ Data retention policies
- ✓ GDPR compliance

### Compliance
- ✓ Medical confidentiality
- ✓ Data protection regulations
- ✓ Transplant guidelines
- ✓ Informed consent
- ✓ Legal documentation

---

## ⚠️ Validation Rules

### Registration
- Email: Valid format, unique
- Password: Min 8 chars, 1 uppercase, 1 number
- Age: Must be 18+
- Phone: Valid format

### Profile
- Blood Group: A+, A-, B+, B-, O+, O-, AB+, AB-
- Height: 100-250 cm
- Weight: 30-200 kg
- Blood Pressure: Valid format (xxx/xx)

### Request
- Organ: Kidney, Liver, Heart, Cornea
- Urgency: Low, Medium, High, Critical
- Test Files: Max 10MB, PDF/JPG/PNG

---

## 📊 Patient Statistics & Reporting

**Patient Dashboard Shows:**
- Request status
- Match progress
- Upcoming appointments
- Document checklist
- Timeline to transplant

**Available Reports:**
- Medical history PDF
- Request summary
- Match details
- Surgery confirmation
- Discharge summary

```
GET /api/patient/dashboard/{patientId}
GET /api/patient/report/{reportType}
```

---

## 🎯 Best Practices for Patients

1. **Complete Profile Fully**
   - Accurate medical history
   - Recent test reports
   - Correct contact information

2. **Upload Quality Documents**
   - Clear scans/photos
   - Recent test results
   - Doctor recommendations

3. **Update Regularly**
   - Health status changes
   - New medications
   - Contact changes

4. **Respond Promptly**
   - Check notifications regularly
   - Accept/reject matches quickly
   - Confirm appointments

5. **Follow Guidelines**
   - Pre-operative instructions
   - Post-transplant care
   - Follow-up appointments

---

## 📞 Support & Help

**Patient Support Options:**
- Live chat within app
- Email: support@ramsetu.com
- Phone: +91-XXX-XXXX-XXXX
- FAQs section
- Video tutorials

**Common Questions:**
- How long does matching take?
- What documents are needed?
- What happens during transplant?
- Recovery timeline?
- Cost information?

---

**Last Updated:** December 2025  
**Version:** 1.0 - Patient Module Documentation
