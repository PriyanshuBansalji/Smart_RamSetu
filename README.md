# RamSetu Health Bridge

A full‑stack organ donation and matching platform connecting donors and patients, with an admin portal for oversight.

**Current Status**: Phase 1 Complete ✅ | Phase 2 (ML Integration) Coming Soon 🔄

This monorepo contains:
- **Main Frontend**: Vite + React (TypeScript) - Donor & Patient Portals
- **Backend API**: Express + MongoDB - Core API Server  
- **Admin Portal**: React Frontend + Express Backend - Admin Dashboard
- **Phase 2 (Planned)**: ML Service for automated compatibility scoring


## Repository layout

```
RAMSETU_ORGAN_DONAR/
├─ DEPLOYMENT_GUIDE.md                    # Cloud deployment steps (Render + Vercel)
├─ deploy.ps1                             # Windows PowerShell deploy script
├─ README.md                              # This file
├─ DBMS/
│  ├─ IMPLEMENTATION_CHECKLIST.md         # Phase 1 & Phase 2 checklist
│  ├─ IMPROVEMENTS_AND_RECOMMENDATIONS.md # Code improvements & Phase 2 roadmap
│  ├─ ramsetu-health-bridge-main/
│  │  ├─ SYSTEM_COMPLETE_README.md        # Complete system documentation
│  │  ├─ src/                             # Main frontend (Vite + React + TS)
│  │  ├─ server/                          # Backend API (Express + MongoDB)
│  │  └─ Admin/
│  │     ├─ admin-frontend/               # Admin UI (Vite + React)
│  │     └─ admin-backend/                # Admin API (Express)
│  └─ ml_hybrid_module/                   # ML Module (Phase 2)
└─ ...
```

**Phase 1 Status**: ✅ Complete
- ✅ Main Frontend (Donor & Patient Portals)
- ✅ Backend API (Express + MongoDB)
- ✅ Admin Portal (Frontend & Backend)
- ✅ Authentication System (JWT)
- ✅ Database Schema (8 collections)

**Phase 2 Status**: 🔄 Planned
- ⏳ ML Service (Python/Flask)
- ⏳ Compatibility Scoring Models
- ⏳ Automated Matching Engine
- ⏳ Advanced Analytics


## Tech stack

### Phase 1 (Current - Complete) ✅
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 18+, Express 4, Mongoose 7, JWT, Multer, Nodemailer
- **Database**: MongoDB Atlas (recommended) or local MongoDB

### Phase 2 (Planned) 🔄
- **ML Service**: Python 3.8+, Flask, XGBoost, scikit-learn, Joblib
- **ML Database**: ML model files, training datasets


## Prerequisites

- Node.js 18+ and npm
- A MongoDB connection (MongoDB Atlas recommended)
- A Gmail account + 16‑digit App Password for email (or swap to your SMTP provider)

Optional:
- Vercel CLI (for frontends deploy)
- Render/Railway account (for backend deploy)


## Environment variables

Backend API (`server/.env`):

```env
# Server
PORT=5000
# Comma‑separated list of allowed CORS origins (overrides defaults)
CORS_ORIGINS=http://localhost:5173,http://localhost:8080

# Database
MONGO_URI=mongodb://localhost:27017/ramsetu-health-bridge
# e.g. mongodb+srv://<user>:<pass>@cluster.mongodb.net/ramsetu-health-bridge

# Auth (choose strong secrets for production)
JWT_SECRET=replace-with-strong-secret
# Optional: additional accepted secrets (comma separated) and admin secret
# JWT_SECRETS=secret1,secret2
# ADMIN_JWT_SECRET=another-strong-secret

# Email (Nodemailer)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Optional
BASE_URL=http://localhost:5000
```

Main Frontend (`ramsetu-health-bridge-main/.env`):

```env
VITE_API_URL=http://localhost:5000
# Optional media (used by some pages)
VITE_LANDING_VIDEO_URL=/videos/awareness.mp4
VITE_DONOR_VIDEO_URL=/videos/awareness.mp4
```

Admin Frontend (`Admin/admin-frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

Admin Backend (`Admin/admin-backend/.env`, optional):

```env
PORT=5001
JWT_SECRET=replace-with-strong-secret
```

> Note: The Admin backend in this repo includes hard‑coded dev credentials inside `index.js`. Replace this with your own auth or remove the service in production.


## Run locally

Open three terminals or run these in sequence.

1) Backend API
- Path: `DBMS/ramsetu-health-bridge-main/server`
- Setup and run:
```powershell
npm install
# create .env as shown above
npm run dev
# or
npm start
```
- Default URL: http://localhost:5000

2) Main Frontend
- Path: `DBMS/ramsetu-health-bridge-main`
- Setup and run:
```powershell
npm install
# create .env as shown above
npm run dev
```
- Opens on Vite’s port (5173 by default)

3) Admin Frontend (optional)
- Path: `DBMS/ramsetu-health-bridge-main/Admin/admin-frontend`
- Setup and run:
```powershell
npm install
# create .env as shown above
npm run dev
```
- Will use an available Vite port (5173/5174)

4) Admin Backend (optional / demo)
- Path: `DBMS/ramsetu-health-bridge-main/Admin/admin-backend`
- Setup and run:
```powershell
npm install
# create .env as shown above
npm start
```
- Default URL: http://localhost:5001


## API quickstart

Backend base URL: `http://localhost:5000/api`

- Auth
  - POST `/auth/signup` – start signup (sends email OTP)
  - POST `/auth/verify-otp` – verify OTP and create user
  - POST `/auth/login` – login (role‑based)
  - GET `/auth/whoami` – current user (requires Authorization: Bearer <token>)

Other resources are available for donors, patients, matches, documents, etc. Explore `server/routes/*` for more endpoints.

CORS: Defaults to common localhost and Vercel origins. Override using `CORS_ORIGINS`.


## File uploads

Uploads are stored under `server/uploads/` (served at `/uploads`). For production, consider cloud storage (e.g., Cloudinary for images or S3 for documents) because many hosts use ephemeral filesystems.


## Deployment

### Phase 1 (Current)
- **Frontends**: Vercel
  - Quick deploy script (Windows PowerShell): `./deploy.ps1`
- **Backend API**: Render or Railway
- **Database**: MongoDB Atlas

Follow the step‑by‑step cloud guide in `DEPLOYMENT_GUIDE.md` (includes MongoDB setup, platform configuration, and troubleshooting).

### Phase 2 (Planned)
- **ML Service**: Render or similar platform
- **Model Storage**: Cloud storage or local filesystem


## Troubleshooting

- MongoDB auth failures: verify user/password and URL‑encode special characters. See the guide’s checklist.
- CORS errors: add your exact frontend domains to `CORS_ORIGINS` or update the default list in `server/index.js`.
- Email sending: use a Gmail App Password (not your normal password), or switch to another SMTP provider.
- Vite dev ports: if 5173 is taken, Vite auto‑increments to the next free port.


## Scripts reference (per package)

- Main frontend (`ramsetu-health-bridge-main`): `dev`, `build`, `preview`, `lint`
- Backend API (`server`): `dev` (nodemon), `start`, `fix-indexes`, `fix-donor-indexes`
- Admin frontend: `dev`, `build`, `preview`
- Admin backend: `start`


## Security notes

- Never commit `.env` files. Use environment variables on your hosting provider.
- Change or remove hard‑coded admin credentials in `Admin/admin-backend/index.js` before any public deployment.
- Use strong, unique `JWT_SECRET` values in production.


## License

This project’s license isn’t specified in the repository. Add a `LICENSE` file if you plan to open‑source it.
---

## 📚 Documentation

### Phase 1 Documentation
- **[SYSTEM_COMPLETE_README.md](DBMS/ramsetu-health-bridge-main/SYSTEM_COMPLETE_README.md)** - Complete system architecture and design
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Step-by-step cloud deployment guide
- **[IMPLEMENTATION_CHECKLIST.md](DBMS/IMPLEMENTATION_CHECKLIST.md)** - Phase 1 & Phase 2 completion status
- **Module READMEs**:
  - [DONOR_MODULE_README.md](DBMS/ramsetu-health-bridge-main/DONOR_MODULE_README.md)
  - [PATIENT_MODULE_README.md](DBMS/ramsetu-health-bridge-main/PATIENT_MODULE_README.md)
  - [ADMIN_MODULE_README.md](DBMS/ramsetu-health-bridge-main/ADMIN_MODULE_README.md)

### Phase 2 Documentation (Planned)
- ML Integration roadmap
- Model training guides
- ML API documentation
- Advanced analytics guides

---

## 🎯 Status

| Component | Phase 1 | Phase 2 |
|-----------|---------|---------|
| Frontend Portals | ✅ Complete | - |
| Backend API | ✅ Complete | - |
| Database | ✅ Complete | - |
| Authentication | ✅ Complete | - |
| ML Service | - | 🔄 Planned |
| Automated Matching | - | 🔄 Planned |
| Analytics | - | 🔄 Planned |

**Overall Status**: Phase 1 Ready ✅ | Phase 2 Coming Soon 🔄