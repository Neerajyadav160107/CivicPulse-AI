# CivicPulse AI

> AI-powered civic complaint management system that analyzes, prioritizes, and tracks public complaints.

## 🚀 Live Demo

**Frontend:**
https://civic-pulse-ai-ruddy-six.vercel.app

**Backend API:**
https://civicpulse-ai-udkw.onrender.com

## 📌 About

CivicPulse AI is a full-stack civic complaint management platform designed to make reporting and managing public issues easier.

Users can submit complaints with descriptions, locations, and optional photo evidence. Google Gemini analyzes each complaint, determines its category and urgency, recommends the appropriate department, analyzes uploaded images, and detects possible duplicate complaints.

Complaints are stored in Firebase Firestore and can be searched, filtered, and tracked through the dashboard.

## ✨ Features

* 📝 Submit civic complaints
* 📍 Location-based complaint information
* 📷 Upload photo evidence
* 🤖 AI-powered complaint analysis
* 🚨 Automatic urgency detection
* 🏷️ Complaint categorization
* 🏢 Department recommendation
* ⚠️ Duplicate complaint detection
* 🖼️ AI-powered image analysis
* 📊 Complaint analytics dashboard
* 🔍 Search complaints
* 🎯 Filter complaints by category, urgency, and status
* 🔄 Update complaint status
* 📱 Responsive design
* ☁️ Deployed frontend and backend

## 🤖 AI Analysis

Google Gemini analyzes submitted complaints and generates:

* Short summary
* Complaint category
* Urgency level
* Appropriate department
* Recommended action
* Image evidence analysis
* Duplicate complaint detection

### Example

```text
Complaint
    ↓
Google Gemini
    ↓
Summary
Category
Urgency
Department
Recommended Action
Image Analysis
Duplicate Detection
```

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend

* Node.js
* Express.js
* Multer
* CORS
* dotenv

### AI

* Google Gemini API

### Database

* Firebase Firestore

### Deployment

* Vercel — Frontend
* Render — Backend

## 🏗️ Architecture

```text
User
  ↓
React + Vite
  ↓
Vercel
  ↓
Node.js + Express
  ↓
Google Gemini
  ↓
Firebase Firestore
```

## 📸 Screenshots

### Dashboard

![CivicPulse AI Dashboard](screenshots/dashboard.png)

### Complaint Analytics

![Complaint Analytics](screenshots/complaint-analytics.png)

### Report an Issue

![Report Issue](screenshots/report-issue.png)

### AI Analysis

![AI Complaint Analysis](screenshots/ai-analysis.png)

### Recent Complaints

![Recent Complaints](screenshots/recent-complaints.png)

### Complaint Filters

![Complaint Filters](screenshots/complaint-filters.png)

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Neerajyadav160107/CivicPulse-AI.git
cd CivicPulse-AI
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT_BASE64=your_firebase_service_account_base64
```

> Never commit `.env` files, Firebase credentials, or API keys to GitHub.

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:3000
```

### 3. Setup the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the local development URL.

## 🔐 Environment Variables

The backend uses environment variables for sensitive credentials.

Required variables:

| Variable                          | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `GEMINI_API_KEY`                  | Google Gemini API key                               |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64-encoded Firebase service-account credentials |

Never expose these credentials publicly.

## 🌐 Deployment

CivicPulse AI uses separate deployments for the frontend and backend.

### Frontend

**Vercel**

https://civic-pulse-ai-ruddy-six.vercel.app

### Backend

**Render**

https://civicpulse-ai-udkw.onrender.com

### Production Flow

```text
User
  ↓
Vercel
  ↓
React + Vite
  ↓
Render
  ↓
Node.js + Express
  ↓
Google Gemini
  ↓
Firebase Firestore
```

## 🔄 Complaint Workflow

```text
User submits complaint
        ↓
Complaint + optional image
        ↓
Express backend
        ↓
Google Gemini analysis
        ↓
Category + urgency + department
        ↓
Duplicate detection
        ↓
Firebase Firestore
        ↓
Dashboard
        ↓
Search / Filter / Status Updates
```

## 🎯 Project Objective

CivicPulse AI demonstrates how artificial intelligence can be integrated into a practical full-stack application to improve the reporting and management of civic issues.

The project combines:

* Full-stack web development
* REST APIs
* AI-powered analysis
* Image analysis
* Cloud database storage
* Complaint management
* Production deployment

## 👨‍💻 Author

**Neeraj Yadav**

CivicPulse AI — Full-stack AI civic complaint management project.

