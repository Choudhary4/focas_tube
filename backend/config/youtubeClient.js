import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function youtubeGet(path, token, params = {}) {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }

  const response = await axios.get(`${BASE_URL}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      ...params,
      key,
    },
  });

  return response.data;
}
