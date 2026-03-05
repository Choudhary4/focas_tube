import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import VideoListItem from '../components/VideoListItem';
import PlayerEmbed from '../components/PlayerEmbed';
import ProgressBar from '../components/ProgressBar';
import PomodoroTimer from '../components/PomodoroTimer';
import { fetchPlaylistVideos } from '../services/youtubeService';
import { getCompletedForPlaylist, setVideoCompleted } from '../utils/progressStorage';
import { usePlaylistLibrary } from '../hooks/usePlaylistLibrary';

export default function PlaylistVideosPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
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

    load().catch(() => alert('Unable to load playlist videos'));
  }, [playlistId, refreshPlaylists, ensurePlaylistById]);

  const firstVideoId = videos[0]?.id;
  const completedCount = useMemo(() => completed.size, [completed]);

  function toggleComplete(videoId, nextValue) {
    const next = new Set(completed);
    if (nextValue) next.add(videoId);
    else next.delete(videoId);
    setCompleted(next);
    setVideoCompleted(playlistId, videoId, nextValue);
  }

  return (
    <PageShell playlists={playlists} onAddPlaylist={addPlaylistByInput} addingPlaylist={adding}>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <PlayerEmbed videoId={firstVideoId} />
          <div className="flex gap-3">
            <button
              onClick={() => firstVideoId && navigate(`/playlists/${playlistId}/videos/${firstVideoId}`)}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Open Dedicated Player
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Start with first video and continue from the list.
            </span>
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
