const KEY = 'focus_tube_completed_videos';

function readState() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getCompletedForPlaylist(playlistId) {
  const state = readState();
  return new Set(state[playlistId] || []);
}

export function setVideoCompleted(playlistId, videoId, completed) {
  const state = readState();
  const current = new Set(state[playlistId] || []);

  if (completed) current.add(videoId);
  else current.delete(videoId);

  state[playlistId] = Array.from(current);
  writeState(state);
}
