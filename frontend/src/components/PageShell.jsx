import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clearAccessToken } from '../services/authStorage';
import { isDarkModeEnabled, toggleDarkMode } from '../hooks/useDarkMode';

export default function PageShell({
  playlists = [],
  onAddPlaylist,
  addingPlaylist = false,
  children,
}) {
  const location = useLocation();
  const [inputValue, setInputValue] = useState('');

  function logout() {
    clearAccessToken();
    window.location.href = '/';
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!onAddPlaylist) return;

    try {
      await onAddPlaylist(inputValue);
      setInputValue('');
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Could not add playlist');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-50 to-emerald-100/40 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-4 p-4 lg:p-6">
        <aside className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">FocusTube</h1>
            <button
              onClick={toggleDarkMode}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
            >
              {isDarkModeEnabled() ? 'Light' : 'Dark'}
            </button>
          </div>

          <Link
            to="/playlists"
            className="mb-3 block rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            All Playlists
          </Link>

          <form onSubmit={handleAdd} className="mb-3 space-y-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste playlist URL/ID"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || addingPlaylist}
              className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              {addingPlaylist ? 'Adding...' : 'Add Playlist'}
            </button>
          </form>

          <div className="max-h-[60vh] space-y-2 overflow-auto pr-1">
            {playlists.map((playlist) => {
              const active = location.pathname.includes(playlist.id);
              return (
                <Link
                  key={playlist.id}
                  to={`/playlists/${playlist.id}`}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    active
                      ? 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  {playlist.title}
                </Link>
              );
            })}
          </div>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
