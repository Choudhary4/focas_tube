import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistVideosPage from './pages/PlaylistVideosPage';
import PlayerPage from './pages/PlayerPage';
import { useDarkMode } from './hooks/useDarkMode';
import { getAccessToken } from './services/authStorage';

function ProtectedRoute({ children }) {
  const token = getAccessToken();
  if (!token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  useDarkMode();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <PlaylistsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists/:playlistId"
        element={
          <ProtectedRoute>
            <PlaylistVideosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists/:playlistId/videos/:videoId"
        element={
          <ProtectedRoute>
            <PlayerPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
