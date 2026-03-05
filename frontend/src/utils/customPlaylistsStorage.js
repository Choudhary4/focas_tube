const KEY = 'focus_tube_custom_playlists';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function write(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export function getCustomPlaylists() {
  return read();
}

export function saveCustomPlaylist(playlist) {
  const existing = read();
  if (existing.some((item) => item.id === playlist.id)) return existing;
  const next = [playlist, ...existing];
  write(next);
  return next;
}
