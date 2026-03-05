import { useEffect } from 'react';
import PlaylistCard from '../components/PlaylistCard';
import PageShell from '../components/PageShell';
import { usePlaylistLibrary } from '../hooks/usePlaylistLibrary';

export default function PlaylistsPage() {
  const { playlists, loading, adding, refreshPlaylists, addPlaylistByInput } = usePlaylistLibrary();

  useEffect(() => {
    refreshPlaylists().catch(() => alert('Could not fetch playlists. Re-login and try again.'));
  }, [refreshPlaylists]);

  return (
    <PageShell playlists={playlists} onAddPlaylist={addPlaylistByInput} addingPlaylist={adding}>
      <h2 className="text-2xl font-semibold tracking-tight">Your Playlists</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
        Clean playlist-only workspace. Choose one to start studying.
      </p>

      {loading ? (
        <p className="mt-6">Loading playlists...</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
