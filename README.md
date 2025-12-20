# VistoAPP (DevLens)

VistoAPP is a MERN-stack MVP that turns your GitHub activity into a customizable, shareable developer portfolio.

This project is designed to be **no-AI**, **free-tier friendly**, and **hackathon-ready**.

---

## Features

### ✅ Completed

- **GitHub OAuth Authentication** - Secure login with GitHub OAuth (Authorization Code flow)
- **JWT Session Management** - HttpOnly cookies for secure session handling
- **User Dashboard** - Private dashboard with user profile and GitHub statistics display
- **Protected Routes** - Frontend route protection with authentication checks
- **Responsive UI** - Modern, clean interface built with Tailwind CSS v4
- **GitHub Data Sync** - Manual sync to fetch and cache GitHub statistics from API
- **Statistics Display** - Real-time display of repositories, languages, commits, stars, and forks
- **Enhanced Repository Data** - Detailed repo information including descriptions, topics, languages, and metadata

### 🚧 In Progress / Planned

- **Design & Customization Page** - Layout editor for customizing portfolio appearance
- **Public Profile** - Shareable profile page at `/u/:username`
- **Layout Customization** - Drag-and-drop layout editor for portfolio sections with pin/unpin repos
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

```
VistoAPP/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components (ProtectedRoute, LoadingSpinner)
│   │   ├── pages/         # Page components (Login, Dashboard, Home, About, Contact)
│   │   ├── store/         # Zustand stores (authStore, statsStore)
│   │   ├── utils/         # Utilities (API client)
│   │   └── App.jsx        # Main app component with routing
│   └── package.json
│
├── server/                 # Express backend
│   ├── models/            # Mongoose models (User, StatsCache)
│   ├── routes/            # API routes (auth.js, stats.js)
│   ├── middleware/        # Express middleware (authMiddleware)
│   ├── index.js           # Server entry point
│   └── package.json
│
└── README.md
```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user and set a password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from "Connect" → "Connect your application"
6. The connection string will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/vistoapp?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with your actual database credentials
8. Add the complete connection string to `server/.env` as `DATABASE_URL`

**Important**: Never commit your actual MongoDB connection string to version control. Only add it to your local `.env` file.

### Local MongoDB

If using a local MongoDB instance, use:
```
DATABASE_URL=mongodb://localhost:27017/vistoapp
```

---

## GitHub OAuth Setup

To enable GitHub OAuth, you'll need to create a GitHub OAuth App:

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: VistoAPP (or your choice)
   - **Homepage URL**: `http://localhost:5173` (or your frontend URL)
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback` (or your backend URL + `/auth/github/callback`)
4. Copy the **Client ID** and **Client Secret**
5. Add them to your `server/.env` file:
   ```env
   GITHUB_CLIENT_ID=<your-client-id>
   GITHUB_CLIENT_SECRET=<your-client-secret>
   ```

---

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB Atlas account (free tier works) OR local MongoDB instance
- GitHub account (for OAuth App setup)

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

### Statistics Routes (`/stats`)

- `GET /stats` - Get cached GitHub statistics for authenticated user (requires JWT)
- `POST /stats/sync` - Sync and fetch latest GitHub data (requires JWT)
  - Fetches repositories, languages, commits, and aggregates statistics
  - Stores detailed repo information (description, topics, stars, forks, etc.)

### Other Routes

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

- ✅ **Private dashboard view** - Completed
  - User profile display with GitHub avatar
  - Real-time statistics cards (repositories, languages, commits)
  - Sync button for refreshing GitHub data
  - Protected routes implementation

- ✅ **GitHub Data Sync & Statistics** - Completed
  - StatsCache model with detailed repository information
  - `/stats/sync` endpoint for fetching GitHub data
  - Fetches repositories (excluding forks), languages, commits, stars, forks
  - Stores detailed repo data: descriptions, topics, languages, dates, metadata
  - Frontend stats store (Zustand) for state management
  - Automatic stats fetching on dashboard load

- 📋 **Public profile at `/u/:username`** - Planned
  - Public-facing portfolio page
  - Shareable URL generation
  - Profile customization visibility

- 🚧 **Layout + theme customization** - Next up
  - Design page at `/dashboard/design`
  - Pin/unpin repositories
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


