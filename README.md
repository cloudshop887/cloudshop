# Cloud Shop

Multi-Vendor Cloud Marketplace for Local Shops.

## Tech Stack
- Frontend: React + Tailwind CSS (Vite)
- Backend: FastAPI (Python)
- Database: MySQL

## Setup

### Frontend
1. Navigate to `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

### Backend
1. Navigate to `backend` directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate venv: `.\venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn app.main:app --reload`

## Features
- Shop Registration
- Product Management
- Search & Compare
- Distance Calculation

## Project Documentation
Detailed project documents, guides, and status reports have been moved to the `documentation/` folder for better organization.
- [Project Overview](documentation/project_overview.md)
- [Deployment Guide](documentation/DEPLOYMENT.md)
- [Troubleshooting](documentation/TROUBLESHOOTING.md)
- [Features List](documentation/FEATURES.md)
- [Forgot Password Guide](documentation/FORGOT_PASSWORD_GUIDE.md)
- [OTP Auth Guide](documentation/OTP_AUTH_GUIDE.md)
- [Product Bulk Upload Guide](documentation/BULK_UPLOAD_GUIDE.md)
