# RamSetu Health Bridge – System Flow & DFDs

This document provides a high-level overview of the system architecture, user flows, and Data Flow Diagrams (DFDs) for the RamSetu Health Bridge platform.

---

## 1. System Overview

RamSetu Health Bridge is a modular platform for organ donation and matching, featuring:
- User Portal (Patients & Donors)
- Admin Dashboard
- Backend API
- Machine Learning Module

---

## 2. User Flow Chart

```mermaid
flowchart TD
    A[Donor/Patient Registration] --> B[Submit Organ Request/Donation]
    B --> C[Backend API]
    C --> D[Database]
    C --> E[ML Matching Engine]
    E --> F[Match Results]
    F --> G[Admin Review]
    G --> H[Notification to Users]
    H --> I[User Dashboard Updates]
```

---

## 3. Admin Flow Chart

```mermaid
flowchart TD
    AA[Admin Login] --> BB[View Requests & Matches]
    BB --> CC[Approve/Reject Matches]
    CC --> DD[Update Database]
    DD --> EE[Trigger Notifications]
```

---

## 4. Data Flow Diagram (DFD – Level 1)

```mermaid
graph TD
    User[User (Donor/Patient)] -->|Registration/Request| API[Backend API]
    API -->|Store/Retrieve| DB[(Database)]
    API -->|Send Data| ML[ML Module]
    ML -->|Match Results| API
    API -->|Notify| Admin[Admin]
    Admin -->|Review/Action| API
    API -->|Status Updates| User
```

---

## 5. Machine Learning Module Flow

```mermaid
flowchart TD
    M1[Receive Donor/Patient Data] --> M2[Preprocess Data]
    M2 --> M3[Load Trained Model]
    M3 --> M4[Predict Compatibility]
    M4 --> M5[Return Ranked Matches]
```

---

## 6. Notes
- Diagrams are in Mermaid.js syntax and can be rendered in supported Markdown viewers or online editors (e.g., mermaid.live).
- For detailed ER diagrams or sequence diagrams, see the /docs or contact the project maintainers.

---

## 7. References
- [Mermaid Live Editor](https://mermaid.live/)
- [Project Main README](./README.md)

---

## 8. Additional Technical Flows

### 8.1 Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as Database
    U->>F: Enter credentials
    F->>B: Send login/signup request
    B->>DB: Validate credentials / create user
    DB-->>B: Success/Failure
    B-->>F: Auth token / error
    F-->>U: Login success or error message
```

### 8.2 Data Update Flow (e.g., Donor/Patient Profile)
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as Database
    U->>F: Edit profile data
    F->>B: Send update request
    B->>DB: Update user record
    DB-->>B: Update status
    B-->>F: Success/Error
    F-->>U: Show update result
```

### 8.3 Notification Flow
```mermaid
sequenceDiagram
    participant S as System Event (e.g., Match Found)
    participant B as Backend API
    participant E as Email/SMS Service
    participant U as User
    S->>B: Trigger notification event
    B->>E: Send notification (email/SMS)
    E-->>U: Deliver notification
```

### 8.4 Machine Learning Model Training Flow
```mermaid
sequenceDiagram
    participant A as Admin/Data Scientist
    participant S as ML Script
    participant D as Dataset (CSV)
    participant M as Model Output
    A->>S: Run training script
    S->>D: Load training data
    S->>S: Train model
    S->>M: Save trained model (joblib)
    S-->>A: Training complete
```
