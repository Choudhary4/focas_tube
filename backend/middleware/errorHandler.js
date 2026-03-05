export function errorHandler(err, _req, res, _next) {
  const status = err.response?.status || 500;
  const message =
    err.response?.data?.error?.message || err.message || 'Internal server error';

  res.status(status).json({ message });
}
