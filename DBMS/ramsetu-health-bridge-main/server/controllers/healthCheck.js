export function healthCheck(req, res) {
  res.json({ status: 'ok', time: new Date().toISOString() });
}
