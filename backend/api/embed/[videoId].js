const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function getVideoId(req) {
  const raw = req.query?.videoId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^[a-zA-Z0-9_-]{6,20}$/.test(value)) return null;
  return value;
}

function sanitizeResponseHeaders(upstreamHeaders) {
  const headers = {};

  for (const [key, value] of upstreamHeaders.entries()) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    if (lower === 'x-frame-options') continue;
    if (lower === 'content-security-policy') continue;
    if (lower === 'content-security-policy-report-only') continue;
    headers[key] = value;
  }

  return headers;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const videoId = getVideoId(req);
  if (!videoId) {
    return res.status(400).json({ message: 'Invalid videoId' });
  }

  const params = new URLSearchParams(req.query || {});
  params.delete('videoId');
  if (!params.has('rel')) params.set('rel', '0');
  if (!params.has('modestbranding')) params.set('modestbranding', '1');

  const target = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: {
        'accept-language': req.headers['accept-language'] || 'en-US,en;q=0.9',
        'user-agent': req.headers['user-agent'] || 'FocusTubeEmbedProxy/1.0',
        'x-forwarded-for': req.headers['x-forwarded-for'] || '',
        referer: 'https://www.youtube.com/',
        origin: 'https://www.youtube.com',
        host: 'www.youtube.com',
      },
      redirect: 'follow',
    });

    const body = await upstream.text();
    const headers = sanitizeResponseHeaders(upstream.headers);

    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', 'https://focas-tube-er95.vercel.app');
    res.setHeader('Vary', 'Origin');

    return res.status(upstream.status).send(body);
  } catch (error) {
    return res.status(502).json({
      message: 'Failed to fetch YouTube embed',
      error: error.message,
    });
  }
}
