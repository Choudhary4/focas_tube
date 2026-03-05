export function extractPlaylistId(input) {
  const value = (input || '').trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const list = url.searchParams.get('list');
    if (list) return list;
  } catch (_err) {
    // Not a URL; continue with raw value parsing.
  }

  const match = value.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match?.[1]) return match[1];

  if (/^[a-zA-Z0-9_-]{10,}$/.test(value)) return value;
  return null;
}
