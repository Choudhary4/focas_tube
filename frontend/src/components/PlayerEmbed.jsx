export default function PlayerEmbed({ videoId }) {
  if (!videoId) {
    return (
      <div className="grid h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">
        Select a video from the list.
      </div>
    );
  }

  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&fs=1&playsinline=1`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
      <iframe
        className="aspect-video w-full"
        src={src}
        title="Focused YouTube Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
