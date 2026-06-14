
# LinkSnap - Premium URL Shortener Platform

LinkSnap is a modern URL shortening platform built with the MERN stack that enables users to create, manage, and analyze shortened URLs through a premium analytics dashboard.

The application goes beyond traditional URL shortening by providing detailed click analytics, custom aliases, QR code generation, link expiry management, public statistics pages, and bulk URL processing.

---

## 🚀 Features

### Core Features

* User Authentication (Register/Login)
* Create Short URLs
* Custom URL Aliases
* URL Redirection
* Click Tracking
* Dashboard Management
* Edit Destination URLs
* Delete URLs
* Search and Filter URLs

### Analytics Features

* Total Click Tracking
* Daily Click Trends
* Device Analytics
* Browser Analytics
* Recent Visit Timeline
* Public Shareable Statistics Page

### Advanced Features

* QR Code Generation
* Link Expiry Management
* Bulk CSV URL Upload
* Toast Notifications
* Responsive Premium UI
* Glassmorphism Design System

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router
* Axios
* Recharts
* React Hot Toast
* React Icons
* QRCode React
* Papa Parse

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Express Rate Limit
* Validator
* UA Parser JS
* Multer

### Database

* MongoDB Atlas

---

## 🏗️ System Architecture

```text
Frontend (React + Vite)
        │
        ▼
REST API (Express.js)
        │
        ▼
MongoDB Atlas
        │
        ▼
Analytics Collection
(Visits, Devices, Browsers, Referrers)
```

---

## 📂 Project Structure

```text
katomarans/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   ├── api.js
    │   └── App.jsx
    └── package.json
```

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone <repository-url>
cd linksnap
```

---

### Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

BASE_URL=http://localhost:5000
```

Run backend:

```bash
npm start
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## 🔑 Authentication Flow

1. User registers an account.
2. JWT token is generated.
3. Token is stored in local storage.
4. Protected routes require authentication.
5. Axios interceptor automatically attaches JWT token.

---

## 📊 Analytics Tracked

For every shortened URL visit, the platform records:

* Timestamp
* Browser Information
* Device Type
* Operating System
* Referrer
* Visitor IP Address

Analytics are visualized using:

* Line Charts
* Pie Charts
* Bar Charts
* Timeline Views

---

## 📱 QR Code Support

Each shortened URL can generate a QR code that can be:

* Viewed in a modal
* Downloaded as an image
* Shared across devices

---

## 📁 Bulk Upload

Users can upload CSV files containing multiple URLs.

Example:

```csv
url
https://google.com
https://github.com
https://openai.com
```

The platform automatically creates shortened URLs for all entries.

---

## ⏰ Expiry Management

Users may optionally set expiration dates for URLs.

Behavior:

* Active links redirect normally.
* Expired links display a friendly expiration page.
* Expired links remain visible in analytics.

---

## 🔒 Security Features

* JWT Authentication
* Protected Routes
* URL Validation
* Rate Limiting
* Input Sanitization
* Custom Alias Validation

---

## 🎨 UI Highlights

* Premium Dark Theme
* Glassmorphism Components
* Responsive Layout
* Animated Cards
* Interactive Charts
* Toast Notifications
* Modern Dashboard Experience

---

## 🧠 AI-Assisted Development

This project was planned and developed using AI-assisted workflows for:

* Feature Planning
* Architecture Design
* UI Improvements
* API Design
* Analytics Modeling
* Documentation

All generated code was reviewed, understood, and customized before integration.

---

## 📝 Assumptions

* Authentication is required to create and manage URLs.
* Public statistics pages are read-only.
* Expired links cannot redirect.
* Analytics data is stored for all visits.
* Users can only manage their own URLs.

---

## 🎥 Demo Video

Add your Loom or YouTube video link here:

https://youtu.be/MdjyYurB-oM

## 👨‍💻 Author

Senthil Kumar

---

## 📄 License

This project is developed for educational and hackathon purposes.

---

This project is a part of a hackathon run by https://katomaran.com
