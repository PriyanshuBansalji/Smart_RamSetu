# RamSetu Health Bridge — Open Innovation (Theme)

Welcome to RamSetu — an open innovation platform for organ donation and transplant matching. This README introduces the project, explains architecture and components, shows how to run and contribute, and points contributors to operational and resiliency guidance.

## Table of Contents
- [Project Overview](#project-overview)
- [Vision & Goals](#vision--goals)
- [Architecture Summary](#architecture-summary)
- [Repository Layout](#repository-layout)
- [Getting Started (developer)](#getting-started-developer)
- [Running the Services](#running-the-services)
- [Machine Learning Module](#machine-learning-module)
- [Deployment & Infrastructure](#deployment--infrastructure)
- [CI / Tests](#ci--tests)
- [Resilience & Scalability](#resilience--scalability)
- [Testing & Quality](#testing--quality)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Support & Contact](#support--contact)
- [License & Acknowledgements](#license--acknowledgements)

## Project Overview

RamSetu Health Bridge is a full-stack platform that connects organ donors and patients, streamlines donation workflows, and uses machine learning to assist match decisions. It contains:

- A React + Vite frontend (Donor, Patient, Admin portals)
- A Node.js + Express backend API and controllers
- A Python ML module for organ-specific matching (XGBoost models)
- A MongoDB datastore (collections for users, donors, patients, matches, requests)
- Utility services (email notifications, rate limiting, validation)

This repository contains the deployment docs, scripts, and the ML module used in development and demonstrations.

## Vision & Goals

- Provide a trustworthy, auditable, and extensible platform for organ donation coordination
- Make the matching pipeline transparent and reproducible (models, datasets, metrics)
- Encourage community contributions to improve models, UX, and operations

## Architecture Summary

High-level flow:

Frontend (React) → HTTPS REST → Node.js API → MongoDB / ML Service / Utilities

Key components:
- Frontend: `ramsetu-health-bridge-main/src` (React + Vite)
- Backend: `ramsetu-health-bridge-main/server` (Express controllers, routes, models)
- ML Module: `ml_hybrid_module/` (training scripts, models, prediction API)
- Data: sample CSVs in `ml_hybrid_module/data/` and pre-trained models in `ml_hybrid_module/models/`

Refer to the detailed system diagram images in `/Images` or the `SYSTEM_COMPLETE_README.md` for the three-tier view.

## Repository Layout

- `ramsetu-health-bridge-main/` — frontend and backend application
  - `server/` — API implementation, controllers, models, routes
  - `src/` — frontend app (React + Vite)
- `ml_hybrid_module/` — ML datasets, training and prediction scripts, saved models
- `SYSTEM_RESILIENCE_README.md` — resilience and scalability guidance
- Deployment docs: `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_CHECKLIST.md`, `README_DEPLOYMENT.md`

## Getting Started (developer)

Prerequisites

- Node.js (LTS, e.g., 18+)
- Python 3.8+ (for the ML module)
- MongoDB (local or Atlas account for cloud testing)
- Yarn or npm

Local setup (quick):

1. Clone this repository.
2. Install server dependencies:

```powershell
cd ramsetu-health-bridge-main/server
npm install
```

3. Install frontend dependencies:

```powershell
cd ../src
npm install
```

4. Set environment variables: create a `.env` file in `server/` with at minimum:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — token secret
- `EMAIL_USER`, `EMAIL_PASS` — for SMTP (optional for dev)

5. Run backend (development):

```powershell
cd ramsetu-health-bridge-main/server
npm run dev
```

6. Run frontend (development):

```powershell
cd ramsetu-health-bridge-main/src
npm run dev
```

## Running the Services

- Backend: supports REST API endpoints in `server/routes/`. Health-check endpoints should exist (`/health` or `/status`) for probes.
- Frontend: Vite-based dev server; build assets via `npm run build` and serve via a CDN or static site host.
- ML service: can be run locally using the included Flask/fastAPI example in `ml_hybrid_module/scripts` or used as a library call from the backend.

Example: run a simple ML prediction (in Python)

```bash
cd ml_hybrid_module
python scripts/predict_and_rank.py --input data/kidney_sample.csv --model models/kidney_model.joblib
```

See `ml_hybrid_module/scripts/` for training and prediction utilities.

## Machine Learning Module

Structure
- `ml_hybrid_module/data/` — datasets used during development and CI
- `ml_hybrid_module/models/` — pre-trained `.joblib` models (commit small sample models only)
- `ml_hybrid_module/scripts/` — training (`train_*.py`), prediction and ranking

Best practices
- Keep model artifacts out of main git history for large files (use LFS or an artifact store)
- Include reproducible training scripts and a `requirements.txt` for the ML environment
- Version your models and log performance metrics (AUROC, precision/recall) with each change

## Deployment & Infrastructure

Recommended stack for production
- Frontend: Vercel / Cloudflare Pages (CDN-backed)
- Backend: Vercel / Railway / Render or containerized on ECS/GKE with an API gateway and autoscaling
- Database: MongoDB Atlas (replica set + backups)
- ML model storage: S3-compatible object storage or managed artifact store
- Background queue: Redis Streams / RabbitMQ / SQS

See `DEPLOYMENT_GUIDE.md` and `README_DEPLOYMENT.md` for step-by-step deployment instructions.

## CI / Tests

- This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs server tests on PRs and pushes to `main`.
- Server tests can be run locally with:

```powershell
cd ramsetu-health-bridge-main/server
npm ci
npm test
```

If you are contributing, ensure your commits are on a feature branch and PRs include passing tests.

## Resilience & Scalability

High-level principles and operational items are documented in [SYSTEM_RESILIENCE_README.md](SYSTEM_RESILIENCE_README.md#L1).

Key takeaways:
- Make API servers stateless and horizontally scalable
- Offload long-running work to a queue and workers
- Use managed DB with backups and monitoring
- Add monitoring (Prometheus/Grafana) and tracing (OpenTelemetry)

## Testing & Quality

- Unit tests: add tests for critical controllers and ML preprocessing steps
- Integration tests: simulate end‑to‑end flows (create donor → create patient → run match)
- Load tests: use `k6` or `locust` to validate autoscaling thresholds

## Contributing

We welcome contributors. Suggested workflow:

1. Fork the repository and create a feature branch.
2. Open a descriptive issue for non-trivial work or ask on Discussions.
3. Follow the coding style used in the repo and include tests for new features.
4. Open a pull request with a clear description and link to the issue.

Please run linters and tests before opening a PR.

## Code of Conduct

Be respectful and inclusive. If you need a starting Code of Conduct, we suggest using the Contributor Covenant.

## Support & Contact

If you need help, open an issue and tag `help wanted`; for security issues, use private channels (maintainers' emails listed in the repository settings).

## License & Acknowledgements

This project is intended for open innovation. Choose an appropriate open-source license (e.g., MIT, Apache 2.0) and add `LICENSE` file. If you want, I can add an `LICENSE` file for you.

---
If you'd like, I can now:

- generate a compact Mermaid diagram and add it to this `README.md`, or
- create a CONTRIBUTING.md and a RUNBOOK for emergency failover steps.
