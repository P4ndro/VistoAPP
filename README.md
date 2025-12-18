# Visto

Visto is a MERN-stack MVP that turns your GitHub activity into a customizable, shareable developer portfolio.

This project is designed to be **no-AI**, **free-tier friendly**, and **hackathon-ready**:

- GitHub OAuth login
- Manual sync + cached GitHub stats
- Private dashboard + public profile
- Layout and theme customization
- Client-side export to PNG/PDF

---

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Recharts
- **State**: Zustand or React Context
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (free tier)
- **Auth**: GitHub OAuth (Authorization Code) + JWT
- **Export**: `html2canvas` + `jsPDF` (frontend only)

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

Create a `.env` file in `server/` with at least:

```bash
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
GITHUB_CLIENT_ID=<your-github-oauth-client-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-client-secret>
CLIENT_URL=http://localhost:5173
```

Frontend will later use:

```bash
VITE_API_URL=http://localhost:5000
```

You do **not** commit real secrets – only `.env.example` (to be added) should be shared.

---

## Running the App Locally

### Backend

From the `server/` directory:

```bash
npm run server
```

This should start the Express API (commonly on `http://localhost:5000` once configured).

### Frontend

From the `client/` directory:

```bash
npm run dev
```

Vite will start the React app (by default `http://localhost:5173`).

---

## Roadmap (MVP)

- GitHub OAuth login + JWT
- Sync GitHub repos/activity into cached stats
- Private dashboard view
- Public profile at `/u/:username`
- Layout + theme customization
- Export profile to PNG/PDF

---

## License

MIT – feel free to use and adapt for your own portfolio or hackathon projects.


