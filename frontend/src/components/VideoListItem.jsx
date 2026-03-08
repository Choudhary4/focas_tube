import { Link, useParams } from 'react-router-dom';

export default function VideoListItem({ playlistId, video, completed, onToggleComplete }) {
  const { videoId } = useParams();
  const active = videoId === video.id;
  const thumbnailSrc =
    video.id && /^[a-zA-Z0-9_-]{6,20}$/.test(video.id)
      ? `https://focas-tube.vercel.app/api/thumbnail/${video.id}`
      : video.thumbnail;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-2 ${
        active
          ? 'border-emerald-400 bg-emerald-50 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/30'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <Link to={`/playlists/${playlistId}/videos/${video.id}`} className="flex min-w-0 flex-1 gap-3">
        <img src={thumbnailSrc} alt={video.title} className="h-20 w-32 rounded-lg object-cover" loading="lazy" />
        <div className="min-w-0">
          <h4 className="line-clamp-2 text-sm font-medium">{video.title}</h4>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">{video.duration}</span>
            {active && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Playing
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={() => onToggleComplete(video.id, !completed)}
        className={`h-8 shrink-0 rounded-lg px-2 text-xs font-medium ${
          completed
            ? 'bg-emerald-700 text-white'
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
        }`}
      >
        {completed ? 'Done' : 'Mark'}
      </button>
    </div>
  );
}
