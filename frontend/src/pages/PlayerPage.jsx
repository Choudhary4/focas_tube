import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import VideoListItem from '../components/VideoListItem';
import PlayerEmbed from '../components/PlayerEmbed';
import ProgressBar from '../components/ProgressBar';
import PomodoroTimer from '../components/PomodoroTimer';
import { fetchPlaylistVideos } from '../services/youtubeService';
import { getCompletedForPlaylist, setVideoCompleted } from '../utils/progressStorage';
import { usePlaylistLibrary } from '../hooks/usePlaylistLibrary';

export default function PlayerPage() {
  const { playlistId, videoId } = useParams();
  const {
    playlists,
    adding,
    refreshPlaylists,
    addPlaylistByInput,
    ensurePlaylistById,
  } = usePlaylistLibrary();
  const [videos, setVideos] = useState([]);
  const [completed, setCompleted] = useState(new Set());

  useEffect(() => {
    async function load() {
      const [items] = await Promise.all([fetchPlaylistVideos(playlistId), refreshPlaylists()]);
      setVideos(items);
      setCompleted(getCompletedForPlaylist(playlistId));
      await ensurePlaylistById(playlistId);
    }

    load().catch(() => alert('Unable to load player data'));
  }, [playlistId, refreshPlaylists, ensurePlaylistById]);

  const activeVideo = videos.find((video) => video.id === videoId);
  const completedCount = useMemo(() => completed.size, [completed]);

  function toggleComplete(id, nextValue) {
    const next = new Set(completed);
    if (nextValue) next.add(id);
    else next.delete(id);
    setCompleted(next);
    setVideoCompleted(playlistId, id, nextValue);
  }

  return (
    <PageShell playlists={playlists} onAddPlaylist={addPlaylistByInput} addingPlaylist={adding}>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <PlayerEmbed videoId={videoId} />
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <h2 className="text-lg font-semibold">{activeVideo?.title || 'Loading video...'}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              Dedicated distraction-free player view.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <PomodoroTimer />
          <ProgressBar completed={completedCount} total={videos.length} />
          <div className="max-h-[55vh] space-y-2 overflow-auto pr-1">
            {videos.map((video) => (
              <VideoListItem
                key={video.id}
                playlistId={playlistId}
                video={video}
                completed={completed.has(video.id)}
                onToggleComplete={toggleComplete}
              />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
