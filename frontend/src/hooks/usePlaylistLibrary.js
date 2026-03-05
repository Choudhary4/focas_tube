import { useCallback, useMemo, useState } from 'react';
import { fetchPlaylistById, fetchPlaylists } from '../services/youtubeService';
import { getCustomPlaylists, saveCustomPlaylist } from '../utils/customPlaylistsStorage';
import { extractPlaylistId } from '../utils/youtube';

function mergePlaylists(primary = [], secondary = []) {
  const map = new Map();
  for (const item of [...primary, ...secondary]) {
    if (!item?.id) continue;
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values());
}

export function usePlaylistLibrary() {
  const [apiPlaylists, setApiPlaylists] = useState([]);
  const [customPlaylists, setCustomPlaylists] = useState(getCustomPlaylists());
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const playlists = useMemo(
    () => mergePlaylists(customPlaylists, apiPlaylists),
    [apiPlaylists, customPlaylists]
  );

  const refreshPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlaylists();
      setApiPlaylists(data);
      setCustomPlaylists(getCustomPlaylists());
    } finally {
      setLoading(false);
    }
  }, []);

  const ensurePlaylistById = useCallback(async (playlistId) => {
    if (!playlistId) return null;
    if (getCustomPlaylists().some((playlist) => playlist.id === playlistId)) return playlistId;

    try {
      const playlist = await fetchPlaylistById(playlistId);
      const saved = saveCustomPlaylist(playlist);
      setCustomPlaylists(saved);
      return playlist.id;
    } catch (_err) {
      return null;
    }
  }, []);

  const addPlaylistByInput = useCallback(async (inputValue) => {
    const id = extractPlaylistId(inputValue);
    if (!id) {
      throw new Error('Enter a valid playlist URL or ID');
    }

    setAdding(true);
    try {
      const playlist = await fetchPlaylistById(id);
      const saved = saveCustomPlaylist(playlist);
      setCustomPlaylists(saved);
      return playlist;
    } finally {
      setAdding(false);
    }
  }, []);

  return {
    playlists,
    loading,
    adding,
    refreshPlaylists,
    addPlaylistByInput,
    ensurePlaylistById,
  };
}
