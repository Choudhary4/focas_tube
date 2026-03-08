function getVideoId(req) {
  const raw = req.query?.videoId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^[a-zA-Z0-9_-]{6,20}$/.test(value)) return null;
  return value;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const videoId = getVideoId(req);
  if (!videoId) {
    return res.status(400).json({ message: 'Invalid videoId' });
  }

  const target = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: {
        'user-agent': req.headers['user-agent'] || 'FocusTubeThumbnailProxy/1.0',
        referer: 'https://www.youtube.com/',
        origin: 'https://www.youtube.com',
      },
      redirect: 'follow',
    });

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', 'https://focas-tube-er95.vercel.app');
    res.setHeader('Vary', 'Origin');

    return res.status(upstream.status).send(buffer);
  } catch (error) {
    return res.status(502).json({
      message: 'Failed to fetch YouTube thumbnail',
      error: error.message,
    });
  }
}
