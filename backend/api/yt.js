const BLOCKED_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
]);

const ALLOWED_HOST_SUFFIXES = [
  'youtube.com',
  'ytimg.com',
  'googlevideo.com',
  'googleusercontent.com',
  'ggpht.com',
  'youtubei.googleapis.com',
];

function isAllowedHost(hostname) {
  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

function getTarget(req) {
  const raw = req.query?.url;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;

  let parsed;
  try {
    parsed = new URL(value);
  } catch (_e) {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  if (!isAllowedHost(parsed.hostname)) return null;
  return parsed;
}

function setForwardedHeaders(req, target) {
  return {
    'user-agent': req.headers['user-agent'] || 'FocusTubeMediaProxy/1.0',
    'accept-language': req.headers['accept-language'] || 'en-US,en;q=0.9',
    accept: req.headers.accept || '*/*',
    range: req.headers.range || '',
    referer: `https://${target.hostname}/`,
    origin: `https://${target.hostname}`,
  };
}

function forwardResponseHeaders(res, upstream) {
  for (const [key, value] of upstream.headers.entries()) {
    if (BLOCKED_RESPONSE_HEADERS.has(key.toLowerCase())) continue;
    res.setHeader(key, value);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const target = getTarget(req);
  if (!target) {
    return res.status(400).json({ message: 'Invalid or disallowed target URL' });
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: req.method,
      headers: setForwardedHeaders(req, target),
      redirect: 'follow',
    });

    forwardResponseHeaders(res, upstream);
    res.setHeader('Access-Control-Allow-Origin', 'https://focas-tube-er95.vercel.app');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'HEAD') {
      return res.status(upstream.status).end();
    }

    const contentType = upstream.headers.get('content-type') || '';

    if (contentType.includes('text/') || contentType.includes('json') || contentType.includes('javascript')) {
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(buf);
  } catch (error) {
    return res.status(502).json({ message: 'Proxy fetch failed', error: error.message });
  }
}
