# FocusTube - Distraction-Free YouTube Study Platform

A minimal study platform where users log in with Google, load only their YouTube playlists, and watch videos in a distraction-free player.

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- APIs: YouTube Data API v3 + Google OAuth (frontend)

## Folder Structure

```text
frontend/
  src/
    components/
    pages/
    hooks/
    services/
    utils/
backend/
  controllers/
  routes/
  middleware/
  config/
```

## Features

- Google OAuth login (`youtube.readonly` scope)
- Fetch and display user playlists
- Playlist details with video list and durations
- Distraction-free embedded player
- Sidebar with playlists
- Pomodoro timer
- Mark videos complete
- Playlist progress bar
- Dark mode toggle

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
YOUTUBE_API_KEY=your_youtube_data_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_BACKEND_URL=http://localhost:5000/api
```

## Google/YouTube Setup

1. Open Google Cloud Console and create/select a project.
2. Enable **YouTube Data API v3**.
3. Create an API key and place it in `backend/.env` as `YOUTUBE_API_KEY`.
4. Configure OAuth consent screen and add test users if app is not published.
5. Create OAuth 2.0 Client ID (Web application).
6. Add allowed origin: `http://localhost:5173`.
7. Put client ID in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`.

## Run Locally

1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Start backend:

```bash
cd backend
npm run dev
```

3. Start frontend:

```bash
cd frontend
npm run dev
```

4. Open `http://localhost:5173`.

## API Endpoints

- `GET /api/playlists`
- `GET /api/playlist/:id/videos`

Both endpoints require `Authorization: Bearer <google_access_token>`.

## Distraction-Free Notes

The app does not show comments, recommendations, homepage feeds, trending, or shorts. Playback is restricted to embedded videos using:

```text
https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1
```
