
# Welcome to Ramsetu

## Project Overview

RamSetu Health Bridge is an end-to-end platform designed to revolutionize the organ donation and transplantation process in India (and globally). The project aims to address the challenges of organ shortage, inefficient matching, and lack of transparency by leveraging modern web technologies and machine learning.

### Key Objectives

- **Streamline Organ Donation:** Make it easy for individuals to register as donors and for patients to request organs.
- **Smart Matching:** Use advanced machine learning models to match donors and recipients based on medical compatibility, urgency, and other factors.
- **Transparency & Efficiency:** Provide real-time status updates, notifications, and a transparent workflow for all stakeholders (patients, donors, admins).
- **Scalability:** Modular architecture allows for easy scaling, addition of new organs, and integration with hospital or government systems.

### Main Modules

- **User Portal:** For patients and donors to register, submit requests, and track status.
- **Admin Dashboard:** For healthcare administrators to manage users, review requests, approve matches, and oversee the process.
- **Backend API:** Handles authentication, data storage, business logic, and communication between modules.
- **Machine Learning Module:** Python-based scripts and models for predicting the best donor-recipient matches using real-world datasets and medical criteria.

### Features in Detail

- **Registration & Authentication:** Secure sign-up and login for all users.
- **Organ Request & Donation Forms:** Collects detailed medical and personal information to ensure accurate matching.
- **Automated Matching:** ML models analyze donor and patient data to suggest the best possible matches, reducing manual effort and bias.
- **Notifications:** Email and in-app notifications keep users informed about their application status and next steps.
- **Admin Controls:** Admins can view all requests, approve or reject matches, and generate reports.
- **Data Security:** Sensitive information is handled securely, with best practices for data privacy and compliance.

### Why This Project Matters

Organ transplantation saves lives, but the process is often slow, opaque, and inefficient. By digitizing and automating key steps, RamSetu Health Bridge aims to:

- Reduce waiting times for patients.
- Increase the number of successful transplants.
- Build trust through transparency and communication.
- Enable data-driven policy and medical decisions.



## How can I edit this code?

There are several ways of editing your application.







**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.

# RamSetu Health Bridge

RamSetu Health Bridge is a comprehensive organ donation and matching platform designed to streamline the process of donor registration, patient requests, and smart organ matching using machine learning. The project features a modern web application for both patients and donors, an admin dashboard, and a backend API with ML-powered matching.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Machine Learning Module](#machine-learning-module)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features
- **Donor & Patient Registration:** Secure forms for organ donors and patients.
- **Smart Organ Matching:** ML-based ranking and prediction for organ compatibility.
- **Admin Dashboard:** Manage users, requests, and matches.
- **Email Notifications:** Automated communication for status updates.
- **Modern UI:** Built with React, Tailwind CSS, and shadcn-ui.
- **RESTful API:** Node.js/Express backend for all operations.
- **Dataset Management:** Scripts for generating and training organ match datasets.

---

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend:** Node.js, Express
- **Machine Learning:** Python, scikit-learn, XGBoost, joblib
- **Database:** MongoDB
- **Other:** Vercel (deployment), ESLint, PostCSS

---

## Project Structure

```
ramsetu-health-bridge-main/
├── Admin/                  # Admin dashboard (frontend & backend)
│   ├── admin-backend/      # Node.js backend for admin
│   └── admin-frontend/     # React frontend for admin
├── Images/                 # Image assets
├── public/                 # Public static files
├── server/                 # Main backend API (Node.js/Express)
│   ├── controllers/        # API controllers
│   ├── middleware/         # Auth and other middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── scripts/            # Utility scripts
│   └── uploads/            # Uploaded documents
├── src/                    # Main frontend (React)
│   ├── assets/             # Frontend assets
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   └── utils/              # API utilities
├── ml_hybrid_module/       # Machine learning module (Python)
│   ├── data/               # Organ datasets (CSV)
│   ├── models/             # Trained ML models (joblib)
│   └── scripts/            # Data generation, training, prediction scripts
├── package.json            # Project metadata and scripts
└── README.md               # This file
```

---

## Setup & Installation

### Prerequisites
- [Node.js & npm](https://nodejs.org/)
- [Python 3.x](https://www.python.org/)
- (Optional) MongoDB or your chosen database

### 1. Clone the Repository
```sh
git clone <YOUR_GIT_URL>
cd ramsetu-health-bridge-main
```

### 2. Install Frontend & Backend Dependencies
```sh
# For main frontend
npm install

# For admin frontend
cd Admin/admin-frontend
npm install

# For admin backend
cd ../admin-backend
npm install

# For main backend
cd ../../../server
npm install
```

### 3. Set Up Machine Learning Module
```sh
cd ../ml_hybrid_module
# (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt  # If requirements.txt exists
```

---

## Usage

### Start the Frontend
```sh
cd ramsetu-health-bridge-main
npm run dev
```

### Start the Backend
```sh
cd server
npm start
```

### Start the Admin Dashboard
```sh
cd Admin/admin-frontend
npm run dev

cd ../admin-backend
npm start
```

### Run Machine Learning Scripts
```sh
cd ml_hybrid_module/scripts
python train_kidney.py  # Example: train a model
python predict_and_rank.py  # Example: run predictions
```

---

## Machine Learning Module
- **Location:** `ml_hybrid_module/`
- **Datasets:** `ml_hybrid_module/data/` (CSV files for each organ)
- **Models:** `ml_hybrid_module/models/` (Pre-trained joblib models)
- **Scripts:** `ml_hybrid_module/scripts/` (Training, prediction, data generation)

**Example Workflow:**
1. Generate or update datasets using `generate_datasets.py`.
2. Train models for each organ using `train_*.py` scripts.
3. Use `predict_and_rank.py` to predict and rank matches.

---

## Deployment

You can deploy the frontend (and optionally backend) to Vercel or your preferred platform.

**To connect a domain:**
1. Navigate to Project > Settings > Domains in your Vercel dashboard.
2. Click Connect Domain and follow the instructions.

---

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---



