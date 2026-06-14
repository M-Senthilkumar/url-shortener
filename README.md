# ⚡ LinkSnap — Premium URL Shortener with Analytics

> **This project is a part of a hackathon run by https://katomaran.com**

LinkSnap is a full-stack URL Shortener platform with rich analytics, real-time click tracking, QR code generation, custom aliases, link expiry, bulk CSV upload, and a stunning dark glassmorphism UI.

---

## 🎥 Demo Video

> **[▶ Watch the Demo on YouTube/Loom](https://your-video-link-here.com)**
> *(Replace this link with your Loom/YouTube recording before submission)*

---

## 🚀 Features

### Core (Mandatory)
| Feature | Status |
|---|---|
| User signup & login with JWT auth | ✅ |
| Password hashing with bcryptjs | ✅ |
| Protected dashboard routes | ✅ |
| URL shortening with unique short codes | ✅ |
| Server-side redirect (`/:shortCode`) | ✅ |
| URL validation (must include http/https) | ✅ |
| Dashboard with all created links | ✅ |
| Show: original URL, short URL, created date, total clicks | ✅ |
| Delete a short URL | ✅ |
| Copy short URL with one click | ✅ |
| Analytics per link: total clicks, last visited, recent visits | ✅ |

### Bonus Features
| Feature | Status |
|---|---|
| Custom alias for short URL | ✅ |
| QR code generation with download | ✅ |
| Expiry date for links (with friendly expired page) | ✅ |
| Device & browser analytics (Desktop/Mobile/Tablet, Browser, OS) | ✅ |
| Daily click trend chart (Line chart – last 30 days) | ✅ |
| Device breakdown pie chart | ✅ |
| Browser breakdown bar chart | ✅ |
| Public stats page (shareable, no login needed) | ✅ |
| Edit destination URL | ✅ |
| Bulk URL shortening via CSV upload | ✅ |
| Password strength indicator | ✅ |
| Search/filter URLs in dashboard | ✅ |
| Rate limiting on redirect & API | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7 |
| **Styling** | Vanilla CSS (dark glassmorphism design system) |
| **Charts** | Recharts |
| **QR Code** | qrcode.react |
| **Notifications** | react-hot-toast |
| **Icons** | react-icons (Feather Icons) |
| **CSV Parsing** | PapaParse |
| **Dates** | date-fns |
| **Backend** | Node.js, Express v5 |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | validator.js |
| **Analytics** | ua-parser-js (device/browser/OS detection) |
| **Rate Limiting** | express-rate-limit |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/linksnap.git
cd linksnap
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create / edit `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here
```

Start backend:
```bash
npm run dev        # development (nodemon)
# or
npm start          # production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

> **Note**: The backend must be running on port 5000 for the frontend to work.

---

## 📁 Project Structure

```
katomarans/
├── backend/
│   ├── server.js                  # Express app + redirect handler
│   ├── .env                       # Environment variables
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── rateLimiter.js         # Rate limiting config
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Url.js                 # URL schema (+ customAlias, expiresAt)
│   │   └── Visit.js               # Visit schema (+ browser, device, os)
│   └── routes/
│       ├── authRoutes.js          # /api/auth/register, /login
│       ├── urlRoutes.js           # /api/url CRUD + bulk
│       └── analyticsRoutes.js    # /api/analytics/:id + /public/:shortCode
│
└── frontend/
    └── src/
        ├── context/AuthContext.jsx  # Global auth state
        ├── api.js                   # Axios client with interceptors
        ├── App.jsx                  # Router setup
        ├── index.css                # Full dark design system
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── StatsCard.jsx
        │   ├── QRModal.jsx
        │   └── Charts.jsx          # Recharts wrappers
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx       # Main management page
            ├── Analytics.jsx       # Per-link analytics
            ├── PublicStats.jsx     # Public shareable stats
            └── BulkUpload.jsx      # CSV bulk upload
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Login /     │  │  Dashboard   │  │  Analytics /         │  │
│  │  Register    │  │  (Protected) │  │  PublicStats /       │  │
│  │              │  │              │  │  BulkUpload          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                       │              │
│  ┌──────▼─────────────────▼───────────────────────▼───────────┐ │
│  │              React (Vite) + AuthContext                     │ │
│  │         axios interceptors → auto-attach JWT token          │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────│────────────────────────────────────┘
                             │  HTTP REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (:5000)                        │
│                                                                 │
│  POST /api/auth/register     POST /api/auth/login               │
│  GET  /api/url               POST /api/url/create               │
│  PUT  /api/url/:id           DELETE /api/url/:id                │
│  POST /api/url/bulk          GET  /api/url/stats/summary        │
│  GET  /api/analytics/:id     GET  /api/analytics/public/:code   │
│  GET  /:shortCode  ──────── Rate Limited ──→ 301 Redirect       │
│                              + ua-parser → browser/device       │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MONGODB ATLAS                            │
│                                                                 │
│  users { name, email, password(hashed) }                        │
│  urls  { originalUrl, shortCode, customAlias, clicks,           │
│           expiresAt, title, isActive, user }                    │
│  visits{ urlId, visitedAt, browser, device, os, referrer, ip }  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Assumptions Made

1. **Single-region deployment**: Geographic analytics (country) are not implemented since IP geolocation requires an external API or database file — device/browser/OS tracking is implemented instead.
2. **Short code uniqueness**: 6-character nanoid codes are generated with a collision-check loop. With 62^6 ≈ 56 billion combinations, collisions are extremely rare.
3. **Custom aliases**: Lowercase alphanumeric + hyphens/underscores only, minimum 3 characters.
4. **CSV bulk upload**: Parsed client-side with PapaParse for instant preview. Maximum 50 URLs per batch.
5. **Rate limiting**: 100 redirects / 15 minutes per IP; 20 URL creations / 15 minutes per IP.
6. **JWT expiry**: Tokens expire in 7 days. Users are automatically logged out when a 401 is received.
7. **No email verification**: Out of scope for hackathon timeframe.
8. **Short URL base**: Configured for `localhost:5000` — update `BASE` constant in frontend and CORS in backend for production deployment.

---

## 📸 UI Screenshots & Sample Output

### Dashboard
- Stats cards: Total Links, Total Clicks, Active Links, Top Link Clicks
- URL creation form with custom alias + expiry + title
- Searchable URL table with copy, QR, analytics, edit, delete actions

### Analytics
- Line chart: daily click trend (30 days)
- Pie chart: Desktop / Mobile / Tablet breakdown
- Bar chart: Browser breakdown (Chrome, Firefox, Safari, etc.)
- Timeline: Last 10 visits with device, browser, OS, time

### MongoDB Collections
```json
// urls collection
{
  "_id": "ObjectId...",
  "originalUrl": "https://www.example.com/very/long/path",
  "shortCode": "abc123",
  "customAlias": null,
  "title": "My Campaign",
  "clicks": 47,
  "isActive": true,
  "expiresAt": null,
  "user": "ObjectId...",
  "createdAt": "2026-06-12T...",
  "updatedAt": "2026-06-12T..."
}

// visits collection
{
  "_id": "ObjectId...",
  "urlId": "ObjectId...",
  "visitedAt": "2026-06-12T17:30:00Z",
  "browser": "Chrome",
  "device": "Desktop",
  "os": "Windows",
  "referrer": "Direct",
  "ip": "192.168.1.1"
}
```

---

## 🤖 AI Planning Document

### AI Tools Used
- **Antigravity IDE (Google DeepMind)** — Primary development assistant for code generation, architecture planning, and full-stack implementation

### Planning Approach
1. **Analyzed requirements** — Read problem statement, identified mandatory + bonus features
2. **Designed architecture** — 3-layer (frontend SPA / Express API / MongoDB)
3. **Identified differentiators** — Premium dark UI, device/browser analytics, all 6 bonus features, public stats page
4. **Phased implementation**:
   - Phase 1: Package installation (backend + frontend)
   - Phase 2: Backend models and routes (enhanced)
   - Phase 3: Frontend core infrastructure (auth context, API client, CSS design system)
   - Phase 4: All pages rebuilt with premium UI
   - Phase 5: All components (Navbar, StatsCard, QRModal, Charts)

### Key Design Decisions
- **Dark glassmorphism UI** to immediately distinguish from Bootstrap-default submissions
- **ua-parser-js on server** for zero-dependency device/browser tracking without external APIs
- **AuthContext + Axios interceptors** for clean, DRY auth handling across the app
- **Recharts** for lightweight, composable charting without heavy dependencies
- **PapaParse client-side** for instant CSV preview before upload

---

> **This project is a part of a hackathon run by https://katomaran.com**
#   u r l - s h o r t e n e r  
 