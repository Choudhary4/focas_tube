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

function injectProxyRuntime(html) {
  const runtime = `
<script>
(function(){
  const backend = 'https://focas-tube.vercel.app';
  const allow = [/youtube\\.com$/i, /ytimg\\.com$/i, /googlevideo\\.com$/i, /googleusercontent\\.com$/i, /ggpht\\.com$/i, /youtubei\\.googleapis\\.com$/i];
  const ok = (u) => allow.some((re)=>re.test(u.hostname));
  const proxify = (value) => {
    try {
      const u = new URL(String(value), location.href);
      if (u.protocol !== 'https:' || !ok(u)) return value;
      return backend + '/api/yt?url=' + encodeURIComponent(u.toString());
    } catch (_e) { return value; }
  };

  const originalFetch = window.fetch;
  window.fetch = function(input, init){
    if (typeof input === 'string') input = proxify(input);
    else if (input && input.url) input = proxify(input.url);
    return originalFetch.call(this, input, init);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url){
    arguments[1] = proxify(url);
    return originalOpen.apply(this, arguments);
  };

  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value){
    if ((name === 'src' || name === 'href') && value) {
      value = proxify(value);
    }
    return setAttr.call(this, name, value);
  };

  const srcDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
  if (srcDesc && srcDesc.set) {
    Object.defineProperty(HTMLMediaElement.prototype, 'src', {
      configurable: true,
      get: srcDesc.get,
      set(v){ srcDesc.set.call(this, proxify(v)); }
    });
  }
})();
</script>`;

  if (html.includes('</head>')) return html.replace('</head>', `${runtime}</head>`);
  return runtime + html;
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
        referer: 'https://www.youtube.com/',
        origin: 'https://www.youtube.com',
      },
      redirect: 'follow',
    });

    const rawBody = await upstream.text();
    const body = injectProxyRuntime(rawBody);
    const headers = sanitizeResponseHeaders(upstream.headers);

    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader('Cache-Control', 'no-store');
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
