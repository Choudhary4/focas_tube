export function requireGoogleToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Google access token' });
  }

  req.googleAccessToken = authHeader.slice(7);
  return next();
}
