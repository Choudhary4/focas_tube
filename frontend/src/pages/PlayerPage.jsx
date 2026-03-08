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

export default function PlayerPage() {
  const { playlistId, videoId } = useParams();
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

    load().catch((err) => alert(err?.response?.data?.message || 'Unable to load player data'));
  }, [playlistId, refreshPlaylists, ensurePlaylistById]);

  const activeVideo = videos.find((video) => video.id === videoId);
  const activeIndex = videos.findIndex((video) => video.id === videoId);
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < videos.length - 1;
  const playlistTitle = playlists.find((playlist) => playlist.id === playlistId)?.title || 'Playlist';
  const completedCount = useMemo(() => completed.size, [completed]);
  const remainingCount = Math.max(videos.length - completedCount, 0);

  function toggleComplete(id, nextValue) {
    const next = new Set(completed);
    if (nextValue) next.add(id);
    else next.delete(id);
    setCompleted(next);
    setVideoCompleted(playlistId, id, nextValue);
  }

  function openPrev() {
    if (!hasPrev) return;
    const prevVideo = videos[activeIndex - 1];
    navigate(`/playlists/${playlistId}/videos/${prevVideo.id}`);
  }

  function openNext() {
    if (!hasNext) return;
    const nextVideo = videos[activeIndex + 1];
    navigate(`/playlists/${playlistId}/videos/${nextVideo.id}`);
  }

  return (
    <PageShell playlists={playlists} onAddPlaylist={addPlaylistByInput} addingPlaylist={adding}>
      <div className="grid gap-5 lg:grid-cols-[1fr_370px]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <PlayerEmbed videoId={videoId} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {playlistTitle}
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
              {activeVideo?.title || 'Loading video...'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Dedicated distraction-free player view.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Videos</p>
                <p className="text-lg font-semibold">{videos.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                <p className="text-lg font-semibold">{remainingCount}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={openPrev}
                disabled={!hasPrev}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
              >
                Previous
              </button>
              <button
                onClick={openNext}
                disabled={!hasNext}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
              {activeVideo && (
                <button
                  onClick={() => toggleComplete(activeVideo.id, !completed.has(activeVideo.id))}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    completed.has(activeVideo.id)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                  }`}
                >
                  {completed.has(activeVideo.id) ? 'Completed' : 'Mark Completed'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:sticky lg:top-6 lg:h-fit">
          <PomodoroTimer />
          <ProgressBar completed={completedCount} total={videos.length} />
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Playlist Queue
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{videos.length} items</span>
            </div>
            <div className="max-h-[52vh] space-y-2 overflow-auto pr-1">
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
      </div>
    </PageShell>
  );
}
