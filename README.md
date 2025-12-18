# VistoAPP (DevLens)

VistoAPP is a MERN-stack MVP that turns your GitHub activity into a customizable, shareable developer portfolio.

This project is designed to be **no-AI**, **free-tier friendly**, and **hackathon-ready**.

---

## Features

### ✅ Completed

- **GitHub OAuth Authentication** - Secure login with GitHub OAuth (Authorization Code flow)
- **JWT Session Management** - HttpOnly cookies for secure session handling
- **User Dashboard** - Private dashboard with user profile and statistics placeholder
- **Protected Routes** - Frontend route protection with authentication checks
- **Responsive UI** - Modern, clean interface built with Tailwind CSS v4

### 🚧 In Progress / Planned

- **GitHub Data Sync** - Manual sync to fetch and cache GitHub statistics
- **Statistics Display** - Show repositories, languages, and activity on dashboard
- **Public Profile** - Shareable profile page at `/u/:username`
- **Layout Customization** - Drag-and-drop layout editor for portfolio sections
- **Theme Customization** - Custom color schemes and styling options
- **Export Functionality** - Client-side export to PNG/PDF using `html2canvas` and `jsPDF`

---

## Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS v4, React Router DOM
- **State Management**: Zustand
- **Backend**: Node.js + Express 5
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: GitHub OAuth (Authorization Code) + JWT with httpOnly cookies
- **Charts**: Recharts (planned)
- **Export**: `html2canvas` + `jsPDF` (planned)

---

## Project Structure

- `client/` – Vite + React frontend (dashboard, customization, public profile)
- `server/` – Express backend (auth, sync, dashboard/config APIs)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/P4ndro/VistoAPP.git
cd VistoAPP
```

### 2. Install dependencies

**Backend**

```bash
cd server
npm install
cd ..
```

**Frontend**

```bash
cd client
npm install
cd ..
```

---

## Environment Variables

### Backend (`server/.env`)

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL=<your-mongodb-atlas-connection-string>
# Alternative: MONGO_URI=<your-mongodb-atlas-connection-string>

JWT_SECRET=<your-random-jwt-secret-key>
GITHUB_CLIENT_ID=<your-github-oauth-app-client-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-app-client-secret>
CLIENT_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### Frontend (`client/.env`)

Create a `.env` file in the `client/` directory (optional, defaults provided):

```env
VITE_API_URL=http://localhost:3000
```

**Note**: Never commit `.env` files with real secrets to version control. Use `.env.example` files for documentation (to be added).

---

## Running the App Locally

### Backend

From the `server/` directory:

```bash
npm run server
```

The Express API will start on `http://localhost:3000` (or the PORT specified in `.env`).

### Frontend

From the `client/` directory:

```bash
npm run dev
```

Vite will start the React app on `http://localhost:5173`.

---

## API Endpoints

### Authentication Routes (`/auth`)

- `GET /auth/github` - Initiate GitHub OAuth login (redirects to GitHub)
- `GET /auth/github/callback` - GitHub OAuth callback handler
- `GET /auth/me` - Get current authenticated user (requires valid JWT)
- `POST /auth/logout` - Logout and clear session cookie

### Current Routes

- `GET /` - Health check endpoint
- `GET /about` - About page (placeholder)
- `GET /contact` - Contact page (placeholder)

---

## Roadmap (MVP)

- ✅ **GitHub OAuth login + JWT** - Completed
  - OAuth flow implemented
  - JWT token generation and validation
  - HttpOnly cookie-based session management
  - Frontend auth state management with Zustand

- ✅ **Private dashboard view** - Completed (UI ready, data sync pending)
  - User profile display
  - Statistics cards (placeholder for GitHub data)
  - Protected routes implementation

- 🚧 **Sync GitHub repos/activity into cached stats** - Next up
  - Create StatsCache model
  - Implement `/sync` endpoint
  - Fetch repositories, languages, and activity from GitHub API
  - Display cached statistics on dashboard

- 📋 **Public profile at `/u/:username`** - Planned
  - Public-facing portfolio page
  - Shareable URL generation
  - Profile customization visibility

- 📋 **Layout + theme customization** - Planned
  - Drag-and-drop section reordering
  - Section visibility toggles
  - Color theme selection
  - Save/load layout configurations

- 📋 **Export profile to PNG/PDF** - Planned
  - Client-side rendering with `html2canvas`
  - PDF generation with `jsPDF`
  - Download functionality

---

## License

MIT – feel free to use and adapt for your own portfolio or hackathon projects.


