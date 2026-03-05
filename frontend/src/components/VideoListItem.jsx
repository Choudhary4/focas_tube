import { Link, useParams } from 'react-router-dom';

export default function VideoListItem({ playlistId, video, completed, onToggleComplete }) {
  const { videoId } = useParams();
  const active = videoId === video.id;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-2 ${
        active
          ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <Link to={`/playlists/${playlistId}/videos/${video.id}`} className="flex min-w-0 flex-1 gap-3">
        <img src={video.thumbnail} alt={video.title} className="h-20 w-32 rounded-lg object-cover" loading="lazy" />
        <div className="min-w-0">
          <h4 className="line-clamp-2 text-sm font-medium">{video.title}</h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{video.duration}</p>
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
