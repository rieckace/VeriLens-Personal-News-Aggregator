const clientsByUserId = new Map();

function writeSse(res, { event, data }) {
  if (event) res.write(`event: ${event}\n`);
  if (data !== undefined) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`data: ${payload}\n`);
  }
  res.write('\n');
}

function addClient(userId, res) {
  const key = String(userId);
  const entry = clientsByUserId.get(key) || new Set();
  entry.add(res);
  clientsByUserId.set(key, entry);

  writeSse(res, { event: 'ready', data: { ok: true } });

  const heartbeat = setInterval(() => {
    try {
      writeSse(res, { event: 'ping', data: { t: Date.now() } });
    } catch {
      // ignore
    }
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  };

  res.on('close', cleanup);
  res.on('error', cleanup);

  return cleanup;
}

function removeClient(userId, res) {
  const key = String(userId);
  const entry = clientsByUserId.get(key);
  if (!entry) return;
  entry.delete(res);
  if (entry.size === 0) clientsByUserId.delete(key);
}

function sendToUser(userId, event, data) {
  const key = String(userId);
  const entry = clientsByUserId.get(key);
  if (!entry || entry.size === 0) return;

  for (const res of entry) {
    try {
      writeSse(res, { event, data });
    } catch {
      removeClient(userId, res);
    }
  }
}

module.exports = { addClient, sendToUser };
