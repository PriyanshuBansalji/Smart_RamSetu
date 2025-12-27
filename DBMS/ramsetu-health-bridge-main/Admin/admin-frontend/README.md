# Ram Setu Admin Dashboard

A modern, responsive admin dashboard for managing organ donors, patients, and donation matches in the Ram Setu organ donation system.

## 📋 Overview

The Admin Dashboard provides a comprehensive interface for administrators to:
- **Manage Donors** - View and search registered organ donors
- **Manage Patients** - Track and edit patient profiles
- **Process Matches** - Approve or reject donor-patient matches
- **Monitor Requests** - Track donation request status and verify documents
- **Export Data** - Download donor and patient data in CSV format

## ✨ Features

### Dashboard Statistics
- **Total Donors** - Real-time count of registered donors
- **Total Patients** - Real-time count of registered patients  
- **Match Requests** - Total matches with pending count
- **Success Rate** - Percentage of approved matches

### Donor Management
- 🔍 **Search & Filter** - Find donors by name, email, or blood group
- 📋 **Donor Registry** - Scrollable list of all registered donors
- 👤 **Donor Profile** - Detailed view with:
  - Personal information (name, email, phone, blood group)
  - Medical details (age, height, weight, BMI, blood pressure)
  - Location information (city, state, country)
  - Consent status and registration details
  - Health summary (allergies, diseases, surgeries)
- ❤️ **Donation Requests** - View organ donation requests with status:
  - ✓ Verified
  - ✓ Donated
  - ✗ Rejected
  - ⏳ Pending
- 📥 **CSV Export** - Download individual donor or all donors data

### Patient Management
- 🏥 **Patient Registry** - Scrollable list of registered patients
- 📝 **Patient Details Modal** - Comprehensive patient information including:
  - Basic info (name, email, blood group, phone)
  - Demographics (gender, date of birth, address)
  - Consent information
  - Edit capability for administrators
- ✏️ **Edit Mode** - Update patient information directly
- 📥 **CSV Export** - Download patient data

### Match Management
- 💼 **Match Requests Grid** - Card-based display of all matches
- 🔽 **Status Filtering** - Filter by All, Pending, Approved, or Rejected
- 🫀 **Organ Filtering** - Filter by Kidney, Liver, Heart, or Cornea
- 🔎 **Search** - Find matches by patient name, donor name, or organ
- ✅ **Approve Matches** - Move matches to approved status
- ❌ **Reject Matches** - Move matches to rejected status
- 📊 **Match Statistics** - View total, pending, approved, and rejected counts

### Request Management
- 📋 **Status Updates** - Change donation request status with remarks
- 💬 **Admin Remarks** - Add notes when verifying or rejecting requests
- 🔗 **Test Reports** - View and download medical test documents
- ✓ **Verify Request** - Mark requests as verified after document review

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- React 18+
- Tailwind CSS
- Backend API running (typically on localhost:5000)

### Installation

1. **Navigate to admin frontend directory:**
```bash
cd Admin/admin-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access the dashboard:**
- Open `http://localhost:5173` (or your configured port)

## ⚙️ Configuration

### Settings Panel

Click the **⚙️ Settings** button in the header to configure:

#### API Configuration
- **API Base URL** - Backend API endpoint (default: `http://localhost:5000`)
- **Admin Token** - JWT authentication token

#### Quick Admin Login (Development)
- **Auth Base** - Admin authentication service URL
- **Email** - Admin email for login
- **Password** - Admin password
- **Login & Set Token** - Automatically fetch and set admin token

### Persisting Settings
Settings are automatically saved to browser session storage:
- `apiBase` - API endpoint
- `adminToken` - JWT token
- `adminAuthUrl` - Authentication service URL

## 🔐 Authentication

### Token Setup

1. **Option A: Manual Token**
   - Paste your JWT admin token in Settings
   - Click Apply

2. **Option B: Quick Login (Development)**
   - Fill in auth credentials
   - Click "Login & Set Token"
   - System automatically fetches and stores token

### Token Requirements
- Must be a valid JWT token with `admin` role
- Role validation in Settings shows detected role: ✓ admin (green) or other (red)
- Invalid tokens will cause 401/403 errors

## 📊 Data Management

### Exporting Data

**Export All Donors:**
1. Go to Donors Registry section
2. Click 📥 button
3. File `donors-YYYY-MM-DD.csv` downloads

**Export All Patients:**
1. Go to Patients Registry section
2. Click 📥 button
3. File `patients-YYYY-MM-DD.csv` downloads

**Export Selected Record:**
1. Select a donor/patient to view details
2. Click 📥 Export button in details panel
3. File downloads as `donor-{id}.csv` or `patient-{id}.csv`

### CSV Format
- Flattened structure for nested objects
- Binary data replaced with `[binary]`
- Proper escaping of special characters
- Date fields in standard format

## 🎨 UI Components

### Color Scheme
- **Emerald** (#10b981) - Donors, Success states
- **Cyan** (#06b6d4) - Patients, Primary actions
- **Amber** (#f59e0b) - Pending states
- **Rose** (#f43f5e) - Rejection/Error states
- **Fuchsia** (#ec4899) - Success metrics

### Status Badges
- ✓ **Verified** - Green background (Emerald)
- ✓ **Donated** - Cyan background
- ✗ **Rejected** - Rose background
- ⏳ **Pending** - Amber background

### Layout
- **Responsive Grid** - Adapts from 1 column (mobile) to 3 columns (desktop)
- **Scrollable Sections** - Max height 65vh with overflow-y-auto
- **Modal Dialogs** - Centered overlays with backdrop blur
- **Smooth Transitions** - 300ms transitions on all interactive elements

## 📡 API Integration

### Required Endpoints

#### Donors
- `GET /api/donor/by-id/{donorId}` - Fetch donor details
- `GET /api/donation-request/by-donor/{donorId}` - Fetch donor's requests

#### Patients
- `GET /api/patient/by-id/{patientId}` - Fetch patient details
- `PUT /api/patient/admin/{userId}` - Update patient profile

#### Matches
- `GET /api/match/all` - Fetch all matches
- `POST /api/match/approve` - Approve a match
- `POST /api/match/reject` - Reject a match

#### Donation Requests
- `PUT /api/donation-request/status` - Update request status with remarks

### Authentication Header
All requests include:
```
Authorization: Bearer {JWT_TOKEN}
```

### Request/Response Examples

**Approve Match:**
```javascript
POST /api/match/approve
{
  "patientId": "patient_id",
  "donorId": "donor_id",
  "organ": "Kidney"
}
```

**Update Request Status:**
```javascript
PUT /api/donation-request/status
{
  "requestId": "request_id",
  "status": "Verified",
  "remarks": "Documents verified by admin",
  "donationDetails": "" // optional
}
```

## 🐛 Troubleshooting

### "Auth failed" Error
**Solution:** 
- Check API URL in Settings
- Verify admin token is valid
- Ensure backend is running
- Token must have `admin` role

### "Failed to load matches" Error
**Solution:**
- Verify API endpoint is correct
- Check network connectivity
- Ensure authentication token is set
- Check browser console for detailed error

### No Data Showing
**Solution:**
- Click Refresh buttons in each section
- Check API responses in browser DevTools
- Verify backend has data
- Clear session storage if needed: `sessionStorage.clear()`

### CSV Export Not Working
**Solution:**
- Browser must allow downloads
- Check browser console for errors
- Ensure data is loaded before exporting
- Try different browser if issue persists

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✓ Fully Supported |
| Firefox | 88+ | ✓ Fully Supported |
| Safari | 14+ | ✓ Fully Supported |
| Edge | 90+ | ✓ Fully Supported |

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│         Admin Dashboard UI              │
└────────┬────────────────────────────────┘
         │
         ├─► Dashboard Stats (Real-time counts)
         │
         ├─► Donor Management
         │   ├─ Search & Filter
         │   ├─ View Profiles
         │   └─ Manage Requests
         │
         ├─► Patient Management
         │   ├─ View Profiles
         │   └─ Edit Information
         │
         └─► Match Management
             ├─ View Matches
             ├─ Filter/Search
             └─ Approve/Reject

         │
         ▼
┌─────────────────────────────────────────┐
│      Backend API (Node.js/Express)      │
│  ┌─────────────────────────────────────┐│
│  │        MongoDB Database              ││
│  │  ├─ Donors                           ││
│  │  ├─ Patients                         ││
│  │  ├─ Matches                          ││
│  │  └─ DonationRequests                 ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## 🛠️ Development

### File Structure
```
Admin/admin-frontend/
├── src/
│   ├── landing.jsx          # Main dashboard component
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── ...
├── public/                  # Static assets
├── package.json             # Dependencies
└── README.md                # This file
```

### Key Dependencies
- `react` - UI library
- `tailwindcss` - Styling
- `vite` - Build tool

### Building for Production
```bash
npm run build
```

## 📝 Notes

- All data is fetched with cache-busting (`_t` parameter)
- Session storage persists settings across page refreshes
- Modals use `z-index` layering (50 for status modal, 40 for patient modal)
- Scrollable sections have custom scrollbar styling
- Loading states use animated skeleton/pulse elements

## 🤝 Contributing

When making changes to the dashboard:
1. Maintain component organization
2. Update relevant API endpoints
3. Test on multiple screen sizes
4. Update this README if adding features
5. Follow existing code style

## 📧 Support

For issues or questions:
- Check the Troubleshooting section
- Review browser console for errors
- Verify API responses in Network tab
- Contact development team

---

**Last Updated:** December 2025  
**Version:** 2.0 (Redesigned)
