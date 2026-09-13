# AI CAREER MAIL GUARDIAN

An AI-powered career email monitoring system for college students built with **FastAPI**, **React**, **TypeScript**, **Gemini AI**, **Firebase Firestore**, **Meta WhatsApp Cloud API**, and **Google Calendar API**.

---

## 🎯 Features

- **Gmail Career Monitoring**: Synchronizes Gmail messages, extracts email headers, strips HTML boilerplate, and deduplicates processed message IDs.
- **Gemini AI Structured Extraction**: Extracts company, role, job type, eligibility criteria, salary/stipend, location, application deadline, interview date/time, required skills, application URL, and actionable student instructions into strict JSON.
- **Smart Priority Engine**: Categorizes emails into:
  - 🔴 **HIGH**: Campus placement drives, interview invitations, test schedules, and tight application deadlines.
  - 🟠 **MEDIUM**: Off-campus internships and job board listings.
  - 🟢 **LOW**: General newsletters and promotional content.
- **Meta WhatsApp Cloud Alerts**: Dispatches formatted WhatsApp alerts for high/medium priority opportunities directly to the student's phone.
- **Google Calendar Synchronization**: Schedule interview rounds and deadline reminders directly into the user's Google Calendar via OAuth.
- **Zero-Trust User Data Isolation**: Enforces Firebase ID Token verification and scopes all Firestore documents under `users/{uid}/...`.
- **Production Credential Guardrails**: Restricts mock driver usage to `APP_ENV=development`. In production (`APP_ENV=production`), missing credentials throw explicit configuration errors.

---

## 🏗️ Architecture Overview

```
User Browser (React + TypeScript UI)
          │
          │ Bearer Firebase ID Token
          ▼
FastAPI Backend (Python Async Service)
    ├─► Verify Firebase ID Token -> Extract UID
    ├─► Gmail API (Server-Side Refresh Tokens)
    ├─► Gemini 2.5 Flash AI Engine (Structured Extraction)
    ├─► Firebase Firestore (User-Isolated Collections)
    ├─► Meta WhatsApp Cloud API (Alert Dispatch)
    └─► Google Calendar API (OAuth Schedule Sync)
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Google Cloud Console Project (with Gmail & Google Calendar API enabled)
- Gemini API Key
- Firebase Project (Firestore & Firebase Auth)
- Meta Developer Account (WhatsApp Cloud API)

---

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` in project root and fill in credentials:
   ```bash
   cp ../.env.example ../.env
   ```

4. Run FastAPI backend server:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   API Docs available at: `http://localhost:8000/docs`

---

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run Vite development server:
   ```bash
   npm run dev
   ```
   Application accessible at: `http://localhost:5173/` (or port assigned by Vite)

---

## 🧪 Testing

Run pytest suite for email cleaning, Gemini priority engine, WhatsApp payload formatting, and calendar events:

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v
```

---

## 📁 Repository Structure

```
AI-CAREER-MAIL-GUARDIAN/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST Endpoints (auth, gmail, emails, alerts, whatsapp, calendar, analytics, settings, integrations)
│   │   ├── config.py        # Settings & production credential guardrails
│   │   ├── main.py          # FastAPI application entrypoint & middleware
│   │   ├── schemas/         # Pydantic JSON schemas
│   │   ├── services/        # Service drivers (gmail, gemini, whatsapp, calendar, firestore, pipeline)
│   │   └── utils/           # Auth verification & HTML email cleaner
│   ├── tests/               # Pytest suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Sidebar, Header, PriorityBadge, StatCard, EmailDetailModal)
│   │   ├── pages/           # Views (Dashboard, Emails, PriorityAlerts, Deadlines, Interviews, Calendar, Analytics, Settings, Integrations)
│   │   ├── services/        # API client
│   │   ├── styles/          # Theme CSS
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── .gitignore
├── firestore.rules
└── README.md
```

---

## 🔐 Security & License

- Never commit `.env` or credentials to git repository.
- Built with MIT License.
