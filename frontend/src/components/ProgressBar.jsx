export default function ProgressBar({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>Playlist Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-2 rounded-full bg-emerald-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
