import { usePomodoro } from '../hooks/usePomodoro';

export default function PomodoroTimer() {
  const { time, isRunning, start, pause, reset } = usePomodoro(25);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Study Timer</p>
      <p className="mt-1 text-2xl font-bold">{time}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={start} className="rounded-lg bg-emerald-700 px-3 py-1 text-sm text-white">
          {isRunning ? 'Running' : 'Start'}
        </button>
        <button
          onClick={pause}
          className="rounded-lg bg-slate-200 px-3 py-1 text-sm dark:bg-slate-700"
        >
          Pause
        </button>
        <button
          onClick={() => reset(25)}
          className="rounded-lg bg-slate-200 px-3 py-1 text-sm dark:bg-slate-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
