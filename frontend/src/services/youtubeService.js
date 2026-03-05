import api from './api';

export async function fetchPlaylists() {
  const { data } = await api.get('/playlists');
  return data.playlists;
}

export async function fetchPlaylistVideos(playlistId) {
  const { data } = await api.get(`/playlist/${playlistId}/videos`);
  return data.videos;
}

export async function fetchPlaylistById(playlistId) {
  const { data } = await api.get(`/playlist/${playlistId}`);
  return data.playlist;
}
