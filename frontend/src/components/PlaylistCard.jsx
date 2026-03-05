import { Link } from 'react-router-dom';

export default function PlaylistCard({ playlist }) {
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <img
        src={playlist.thumbnail}
        alt={playlist.title}
        className="h-40 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h2 className="line-clamp-2 text-base font-semibold">{playlist.title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{playlist.videoCount} videos</p>
      </div>
    </Link>
  );
}
