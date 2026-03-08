import { youtubeGet } from '../config/youtubeClient.js';

function mapPlaylist(item) {
  return {
    id: item.id,
    title: item.snippet.title,
    thumbnail:
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url ||
      '',
    videoCount: item.contentDetails.itemCount,
  };
}

function parseISODuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = Number(match[1] || 0);
  const mins = Number(match[2] || 0);
  const secs = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function mapVideo(item, duration) {
  return {
    id: item.contentDetails.videoId,
    title: item.snippet.title,
    thumbnail:
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url ||
      '',
    duration,
  };
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function getPlaylistsByIds(token, ids = []) {
  const validIds = ids.filter(Boolean);
  if (!validIds.length) return [];

  const idChunks = chunk(validIds, 50);
  const result = [];

  for (const idPart of idChunks) {
    const data = await youtubeGet('playlists', token, {
      part: 'snippet,contentDetails',
      id: idPart.join(','),
      maxResults: 50,
    });
    result.push(...(data.items || []));
  }

  return result;
}

export async function getPlaylists(req, res, next) {
  try {
    const token = req.googleAccessToken;
    let nextPageToken = undefined;
    const ownPlaylists = [];

    do {
      const data = await youtubeGet('playlists', token, {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      ownPlaylists.push(...(data.items || []));
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // Include personal system playlists when available (likes/watch later/uploads).
    let relatedPlaylists = [];
    try {
      const channelData = await youtubeGet('channels', token, {
        part: 'contentDetails',
        mine: true,
        maxResults: 1,
      });
      const related = channelData.items?.[0]?.contentDetails?.relatedPlaylists || {};
      const relatedIds = [related.likes, related.watchLater, related.uploads, related.favorites];
      relatedPlaylists = await getPlaylistsByIds(token, relatedIds);
    } catch (_err) {
      // Non-fatal: continue with available playlists.
    }

    const merged = [...ownPlaylists, ...relatedPlaylists];
    const unique = new Map();
    for (const playlist of merged) {
      if (!unique.has(playlist.id)) unique.set(playlist.id, mapPlaylist(playlist));
    }

    const playlists = Array.from(unique.values());
    res.json({ playlists });
  } catch (error) {
    next(error);
  }
}

export async function getPlaylistVideos(req, res, next) {
  try {
    const token = req.googleAccessToken;
    const { id } = req.params;
    const initialLimit = Number(process.env.PLAYLIST_INITIAL_VIDEOS || 50);
    const data = await youtubeGet('playlistItems', token, {
      part: 'snippet,contentDetails',
      playlistId: id,
      maxResults: Math.min(Math.max(initialLimit, 1), 50),
    });

    const limitedItems = (data.items || []).filter(
      (item) => item.contentDetails?.videoId && item.snippet?.title !== 'Deleted video'
    );

    const videoIds = limitedItems.map((item) => item.contentDetails.videoId);
    const chunks = chunk(videoIds, 50);
    const durationMap = {};

    const detailResponses = await Promise.all(
      chunks.map((ids) =>
        youtubeGet('videos', token, {
          part: 'contentDetails',
          id: ids.join(','),
          maxResults: 50,
        })
      )
    );

    for (const details of detailResponses) {
      for (const video of details.items || []) {
        durationMap[video.id] = parseISODuration(video.contentDetails.duration);
      }
    }

    const videos = limitedItems.map((item) =>
      mapVideo(item, durationMap[item.contentDetails.videoId] || '0:00')
    );

    res.json({ videos });
  } catch (error) {
    next(error);
  }
}

export async function getPlaylistById(req, res, next) {
  try {
    const token = req.googleAccessToken;
    const { id } = req.params;

    const data = await youtubeGet('playlists', token, {
      part: 'snippet,contentDetails',
      id,
      maxResults: 1,
    });

    const playlist = data.items?.[0];
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or not accessible' });
    }

    return res.json({ playlist: mapPlaylist(playlist) });
  } catch (error) {
    return next(error);
  }
}
